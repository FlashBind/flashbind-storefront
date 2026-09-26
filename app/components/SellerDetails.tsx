import {SELLER} from '~/config/seller';

/**
 * The seller's company details (legal name, company code, VAT code, address,
 * email). Until the seller is confirmed in ~/config/seller it shows only the
 * brand and contact email, so placeholders never appear on the site.
 */
export function SellerDetails({className}: {className?: string}) {
  if (!SELLER.confirmed) {
    return (
      <p className={className}>
        FlashBind, <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>
      </p>
    );
  }
  return (
    <address className={`not-italic ${className ?? ''}`}>
      {SELLER.legalName}
      <br />
      Company code: {SELLER.companyCode}
      <br />
      VAT code: {SELLER.vatCode}
      <br />
      {SELLER.address}
      <br />
      <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>
    </address>
  );
}
