/**
 * Delivery estimates shown on the shipping policy.
 *
 * DRAFT: fill these in to match the shipping rates set up in Shopify admin,
 * then set `confirmed: true`. Until then the page tells customers that the
 * estimate for their address is shown at checkout.
 */
export const SHIPPING = {
  confirmed: false as boolean,
  dispatchBusinessDays: '[N]',
  estimates: [
    {region: 'Lithuania', time: '[X–Y] business days'},
    {region: 'Other EU countries', time: '[X–Y] business days'},
    {region: 'Rest of the world', time: '[X–Y] business days'},
  ],
} as const;
