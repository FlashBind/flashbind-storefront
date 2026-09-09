import { createClient } from '@supabase/supabase-js';
import { generateBatch, claimTagAtomically } from './app/utils/tagAdmin.server';
import { randomUUID } from 'node:crypto';

async function run() {
  console.log("Running real disposable-Supabase concurrency integration script...");

  if (process.env.NFC_INTEGRATION_ALLOW_DISPOSABLE !== 'I_CONFIRM_DISPOSABLE') {
    console.error("[ERROR] SAFETY ABORT: NFC_INTEGRATION_ALLOW_DISPOSABLE is not I_CONFIRM_DISPOSABLE.");
    console.error("This script requires an explicitly disposable Supabase instance to prevent accidental production writes.");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const expectedUrl = process.env.EXPECTED_SUPABASE_URL;

  if (!url || !key || !expectedUrl) {
    console.error("[ERROR] Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or EXPECTED_SUPABASE_URL environment variables.");
    process.exit(1);
  }

  if (url !== expectedUrl) {
    console.error("[ERROR] SAFETY ABORT: SUPABASE_URL does not match EXPECTED_SUPABASE_URL.");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const batchRef = "REAL-CONCURRENCY-TEST-" + randomUUID().slice(0, 8).toUpperCase();
  let createdBatchId: string | null = null;

  try {
    console.log(`Dispatching 5 concurrent generateBatch requests for ${batchRef}...`);
    const promises = Array(5).fill(0).map(() => generateBatch(batchRef, supabase));

    const results = await Promise.all(promises);

    console.log("\nResults from 5 concurrent requests:");
    results.forEach((r, i) => console.log(`Request ${i + 1}:`, r.success ? 'Success' : 'Error', r.message || r.error));

    const successfulResult = results.find(r => 'batchId' in r && typeof r.batchId === 'string' && r.batchId.length > 0);
    if (successfulResult && successfulResult.batchId) {
      createdBatchId = successfulResult.batchId;
    }

    if (!results.every(r => r.success === true)) {
      throw new Error("Not all generateBatch requests succeeded.");
    }

    const firstBatchId = results[0].batchId;
    if (!firstBatchId || !results.every(r => r.batchId === firstBatchId)) {
      throw new Error("Inconsistent or empty batchIds returned.");
    }
    createdBatchId = firstBatchId;

    const { count: batchCount, error: batchErr } = await supabase.from('tag_batches').select('id', { count: 'exact', head: true }).eq('batch_reference', batchRef);
    if (batchErr) throw batchErr;

    const { count: tagCount, error: tagErr } = await supabase.from('tags').select('id', { count: 'exact', head: true }).eq('batch_id', createdBatchId);
    if (tagErr) throw tagErr;

    console.log(`\nTotal batches in DB for this reference: ${batchCount}`);
    console.log(`Total tags in DB for this batch: ${tagCount}`);

    if (batchCount !== 1 || tagCount !== 100) {
      throw new Error("Batch or tag count mismatch.");
    }

    const { data: tags, error: tagsErr } = await supabase.from('tags').select('id, type, product_variant, item_number').eq('batch_id', createdBatchId);
    if (tagsErr) throw tagsErr;

    const itemNumbers = new Set(tags.map(t => t.item_number));
    if (itemNumbers.size !== 100) throw new Error("Item numbers are not unique.");
    for (let i = 1; i <= 100; i++) {
      if (!itemNumbers.has(i)) throw new Error(`Missing item number ${i}`);
    }

    const typeCounts: Record<string, number> = {};
    for (const tag of tags) {
      const key = `${tag.type}-${tag.product_variant}`;
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    }

    if (
      typeCounts['menu-digital-menu'] !== 25 ||
      typeCounts['wifi-guest-wifi'] !== 25 ||
      typeCounts['pet_tag-black-pet-tag'] !== 25 ||
      typeCounts['pet_tag-white-pet-tag'] !== 25
    ) {
      throw new Error("Composition mismatch: " + JSON.stringify(typeCounts));
    }

    console.log("\nTesting atomic conditional update for claiming...");
    const testTag = tags[0];
    const candidateEmails = ['owner1@test.com', 'owner2@test.com', 'owner3@test.com', 'owner4@test.com', 'owner5@test.com'];

    const claimPromises = candidateEmails.map(async email => {
      const result = await claimTagAtomically(supabase, testTag.id, email, true, { is_claimed: true, owner_email: email, pet_name: 'Test' });
      return { email, ...result };
    });
    const claimResults = await Promise.all(claimPromises);

    const successfulClaims = claimResults.filter(r => 'success' in r && r.success);
    if (successfulClaims.length !== 1) {
      throw new Error(`Expected exactly 1 successful claim, got ${successfulClaims.length}`);
    }

    const { data: claimedTag, error: checkErr } = await supabase.from('tags').select('is_claimed, owner_email').eq('id', testTag.id).single();
    if (checkErr) throw checkErr;
    if (!claimedTag.is_claimed || claimedTag.owner_email !== successfulClaims[0].email) {
      throw new Error("Tag state does not match the winning claim.");
    }

    console.log("\n[PASS] Concurrency test PASSED! Exactly 1 batch and 100 tags created on real database, all requests succeeded idempotently.");

  } catch (err: any) {
    console.error("\n[ERROR] Concurrency test FAILED!", err);
    process.exitCode = 1;
  } finally {
    if (createdBatchId) {
      console.log("\nCleaning up test data...");
      const { error: delTagsErr } = await supabase.from('tags').delete().eq('batch_id', createdBatchId);
      if (delTagsErr) {
        console.error("[ERROR] Failed to delete tags for batch_id:", createdBatchId, delTagsErr);
        process.exitCode = 1;
      } else {
        const { error: delBatchErr } = await supabase.from('tag_batches').delete().eq('id', createdBatchId);
        if (delBatchErr) {
          console.error("[ERROR] Failed to delete batch:", createdBatchId, delBatchErr);
          process.exitCode = 1;
        }
      }
    }
  }
}

run().catch(err => {
  console.error("Unhandled integration test error", err);
  process.exitCode = 1;
});
