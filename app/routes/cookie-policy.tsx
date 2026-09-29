import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {PolicyLayout, PolicyHeading} from '~/components/PolicyLayout';
import {SellerDetails} from '~/components/SellerDetails';
import {SELLER} from '~/config/seller';

// DRAFT for legal review (LEGAL-001, LEGAL-003). EU cookie notice. The list
// matches what the site sets as of 2026-09-28: our login session cookie, the
// Hydrogen cart cookie, the consent choice (our localStorage key
// flashbind_cookie_consent plus Shopify's consent cookie), and Shopify's
// analytics/marketing cookies, which load only after "Accept". Durations of
// Shopify's cookies are taken from Shopify's published cookie list; confirm
// them in the legal review. Keep this list in sync with the code.

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Cookie Policy'}];
};

const link = 'text-[#1E3A8A] underline';
const cell = 'p-3 border-b align-top';

const ESSENTIAL = [
  {
    name: 'session',
    by: 'FlashBind',
    purpose: 'Keeps you logged in to your FlashBind account.',
    duration: 'Until you close your browser or log out',
  },
  {
    name: 'cart',
    by: 'FlashBind (Shopify cart)',
    purpose: 'Remembers what is in your shopping cart.',
    duration: '14 days',
  },
  {
    name: 'flashbind_cookie_consent (browser storage) and _tracking_consent',
    by: 'FlashBind and Shopify',
    purpose: 'Remembers your cookie choice so we don’t ask again and only load the cookies you allowed.',
    duration: 'Until you change it (browser storage); 1 year (_tracking_consent)',
  },
];

const OPTIONAL = [
  {
    name: '_shopify_y, _shopify_s',
    by: 'Shopify',
    purpose: 'Analytics: counts visits and how the shop is used (for example which pages are viewed), so we can improve it.',
    duration: '1 year (_shopify_y); 30 minutes (_shopify_s)',
  },
  {
    name: '_shopify_sa_p, _shopify_sa_t',
    by: 'Shopify',
    purpose: 'Marketing: tells us which link or campaign brought a visitor to the shop.',
    duration: '30 minutes',
  },
];

function CookieTable({rows}: {rows: typeof ESSENTIAL}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-200">
        <thead className="bg-slate-50 text-slate-900">
          <tr>
            <th className="text-left p-3 border-b">Name</th>
            <th className="text-left p-3 border-b">Set by</th>
            <th className="text-left p-3 border-b">What it does</th>
            <th className="text-left p-3 border-b">How long</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className={`${cell} font-mono text-xs break-words`}>{row.name}</td>
              <td className={cell}>{row.by}</td>
              <td className={cell}>{row.purpose}</td>
              <td className={cell}>{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <PolicyLayout title="Cookie Policy">
      <p className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
        Draft: this policy is waiting for legal review.
      </p>
      <p>
        This policy explains which cookies and similar browser storage the FlashBind website uses, what they do, and
        how you can change your choice. It follows the EU rules on cookies (the ePrivacy Directive as applied in
        Lithuania) and the GDPR.
      </p>

      <PolicyHeading>1. Who we are</PolicyHeading>
      <SellerDetails className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm" />

      <PolicyHeading>2. What cookies are</PolicyHeading>
      <p>
        Cookies are small text files a website saves in your browser. Browser storage works in a similar way. We use
        both only for the purposes listed below.
      </p>

      <PolicyHeading>3. Essential cookies (always on)</PolicyHeading>
      <p>
        These are needed for the shop and your account to work, so they don&apos;t need your consent. We don&apos;t use them
        to track you.
      </p>
      <CookieTable rows={ESSENTIAL} />

      <PolicyHeading>4. Analytics and marketing cookies (only with your consent)</PolicyHeading>
      <p>
        Our shop runs on Shopify. Shopify&apos;s analytics and marketing cookies are set <strong>only if you click
        &ldquo;Accept All Cookies&rdquo;</strong> in our cookie banner. If you choose &ldquo;Reject Non-Essential&rdquo;, or
        make no choice, they are not set. We don&apos;t use advertising cookies and we don&apos;t sell your personal data.
      </p>
      <CookieTable rows={OPTIONAL} />

      <PolicyHeading>5. Checkout</PolicyHeading>
      <p>
        When you go to checkout, you move to Shopify&apos;s checkout pages. Shopify sets the cookies it needs to process
        your order and payment there. See Shopify&apos;s cookie and privacy information for details.
      </p>

      <PolicyHeading>6. Changing your choice</PolicyHeading>
      <p>
        You can change your choice at any time by clicking <strong>&ldquo;Cookie settings&rdquo;</strong> at the bottom of
        every page. You can also delete cookies in your browser settings; the banner will then ask you again.
      </p>

      <PolicyHeading>7. More information</PolicyHeading>
      <p>
        How we handle personal data is explained in our <Link to="/privacy-policy" className={link}>Privacy Policy</Link>.
        Questions about cookies: <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a>.
      </p>
    </PolicyLayout>
  );
}
