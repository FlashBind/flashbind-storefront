/**
 * Seller identity shown on the legal pages (LEGAL-001).
 *
 * DRAFT: the seller entity is not decided yet. While `confirmed` is false,
 * nothing from this file is rendered, so the placeholders can never reach
 * the live site. Fill in every field, have the text reviewed, then set
 * `confirmed: true`.
 */
export const SELLER = {
  confirmed: false as boolean,
  legalName: '[SELLER LEGAL NAME]',
  companyCode: '[COMPANY CODE]',
  address: '[REGISTERED ADDRESS]',
  email: 'info@flashbind.com',
} as const;
