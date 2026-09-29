/**
 * Seller identity shown on the legal pages and in the footer (LEGAL-001).
 *
 * This is the only place the seller's details live: to change the seller
 * (e.g. to the owner's own company later), edit this object. If
 * `confirmed` is set to false, none of these fields are shown and the pages
 * fall back to the brand name and the contact email.
 */
export const SELLER = {
  confirmed: true as boolean,
  legalName: 'Cortexa, MB',
  companyCode: '308009417',
  vatCode: 'LT100020373511',
  address: 'Malūnininkų g. 7, LT-92262 Klaipėda, Lithuania',
  country: 'Lithuania',
  // Consumer disputes and data protection bodies of the seller's country.
  consumerDisputeBody: 'the State Consumer Rights Protection Authority (vvtat.lt)',
  dataProtectionAuthority: 'the State Data Protection Inspectorate (vdai.lrv.lt)',
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
