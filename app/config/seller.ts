/**
 * Seller identity shown on the legal pages and in the footer (LEGAL-001).
 *
 * DRAFT: the seller entity is not decided yet. While `confirmed` is false,
 * none of the placeholder fields below are rendered anywhere; the pages
 * fall back to the brand name and the contact email instead. Fill in every
 * field, have the policies reviewed, then set `confirmed: true`.
 */
export const SELLER = {
  confirmed: false as boolean,
  legalName: '[SELLER LEGAL NAME]',
  companyCode: '[COMPANY CODE]',
  vatCode: '[VAT CODE]',
  address: '[REGISTERED ADDRESS]',
  country: '[COUNTRY]',
  // Consumer disputes and data protection bodies of the seller's country,
  // e.g. for Lithuania: the State Consumer Rights Protection Authority
  // (vvtat.lt) and the State Data Protection Inspectorate (vdai.lrv.lt).
  consumerDisputeBody: '[CONSUMER DISPUTE BODY AND WEBSITE]',
  dataProtectionAuthority: '[DATA PROTECTION AUTHORITY AND WEBSITE]',
  email: 'info@flashbind.com',
} as const;

/** The seller's legal name once confirmed, otherwise the brand name. */
export function sellerName(): string {
  return SELLER.confirmed ? SELLER.legalName : 'FlashBind';
}

/** One-line identity for notices and forms: name, code, address, email. */
export function sellerContactLine(): string {
  return SELLER.confirmed
    ? `${SELLER.legalName}, company code ${SELLER.companyCode}, ${SELLER.address}, ${SELLER.email}`
    : `FlashBind, ${SELLER.email}`;
}

/** Date shown as "Last updated" on every policy page. Update when publishing. */
export const POLICIES_LAST_UPDATED = '26 September 2026';
