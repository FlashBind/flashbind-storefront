import {Form, useActionData, useNavigation} from 'react-router';
import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';
import {
  DEFAULT_BRAND_COLOR,
  brandTextOnWhite,
  inkOnBrandColor,
  tintBrandColor,
} from '~/utils/brandColor';
import {DUAL_CHOICE_TEXT, type DualChoiceText, type FeedbackErrorCode, type PageLanguage} from '~/lib/dualChoiceText';

// Google policy (no review gating): both options are always shown, with the
// same size and style, in a fixed order, and nothing is asked before them.
// Keep it that way -- see PLAN_DUAL_CHOICE_FEEDBACK.md.

type Props = {
  tagId: string;
  /** Legal name: named in the privacy note and the contact consent. */
  businessName: string;
  /** Short name shown everywhere else; defaults to the legal name. */
  displayName?: string;
  logo: string | null;
  /** The logo's solid background colour; the logo then fills its tile. */
  logoBackground?: string | null;
  locationLabel: string;
  /** Lowercase #rrggbb, or null for the default. */
  brandColor?: string | null;
  language: PageLanguage;
  initiallyShowForm: boolean;
  sent: boolean;
};

type FeedbackValues = {message: string; contactName: string; contactEmail: string; contactPhone: string};
type ActionResult = {error?: FeedbackErrorCode; values?: FeedbackValues} | undefined;
type ErrorField = 'message' | 'email' | 'phone' | 'consent' | 'form';

/** Where each error is shown: next to its field, or above the button. */
const ERROR_FIELD: Record<FeedbackErrorCode, ErrorField> = {
  message_required: 'message',
  message_too_long: 'message',
  email_invalid: 'email',
  phone_invalid: 'phone',
  consent_required: 'consent',
  rate_limited: 'form',
  save_failed: 'form',
};

const ERROR_TEXT_CLASS = 'mt-2 flex items-start gap-1.5 text-sm font-semibold leading-snug text-red-700';

// One class for both options, so neither is favoured.
const OPTION_CLASS =
  'group flex w-full items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--brand-soft)] hover:shadow-[0_14px_40px_rgba(15,23,42,0.10)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--brand-ring)] active:translate-y-0';

const INPUT_CLASS =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-[color:var(--brand-text)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-ring)]';
const INPUT_INVALID_CLASS = 'border-red-400 ring-4 ring-red-100';

export function DualChoicePage({
  tagId,
  businessName,
  displayName,
  logo,
  logoBackground,
  locationLabel,
  brandColor,
  language,
  initiallyShowForm,
  sent,
}: Props) {
  const t = DUAL_CHOICE_TEXT[language];
  const actionData = useActionData() as ActionResult;
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(initiallyShowForm || Boolean(actionData?.error));
  const sending = navigation.state === 'submitting';
  const shownName = displayName || businessName;
  const name = shownName || t.fallbackName;
  const legalName = businessName || name;
  const brand = brandColor || DEFAULT_BRAND_COLOR;
  const brandStyle = {
    '--brand': brand,
    '--brand-ink': inkOnBrandColor(brand),
    '--brand-text': brandTextOnWhite(brand),
    '--brand-tint': tintBrandColor(brand, 0.1),
    '--brand-soft': tintBrandColor(brand, 0.35),
    '--brand-ring': tintBrandColor(brand, 0.25),
    '--brand-glow': tintBrandColor(brand, 0.18),
  } as CSSProperties;
  const compact = showForm || sent;

  return (
    <div
      style={brandStyle}
      className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-900 md:flex md:items-center md:justify-center md:py-12"
    >
      {/* Soft brand-coloured glow behind the header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-[color:var(--brand-glow)] opacity-80 blur-3xl"
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-5 pb-6 pt-10 md:min-h-0 md:rounded-[2.5rem] md:border md:border-white md:bg-white/70 md:px-8 md:pb-7 md:pt-12 md:shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:backdrop-blur-xl">
        <header className={`flex flex-col items-center text-center ${compact ? 'mb-6' : 'mb-8'}`}>
          <BusinessMark
            logo={logo}
            background={logoBackground ?? null}
            name={shownName}
            alt={shownName ? t.logoAlt(shownName) : ''}
            size={compact ? 'small' : 'large'}
          />
          {locationLabel ? (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" />
              {locationLabel}
            </span>
          ) : null}
          {!compact ? (
            <>
              <h1 className="mt-6 text-[2rem] font-semibold leading-[1.1] tracking-tight text-slate-900">
                {t.headline}
                {shownName ? (
                  <span className="mt-1 block font-serif italic text-[color:var(--brand-text)]">{shownName}</span>
                ) : null}
              </h1>
              <p className="mt-3 max-w-[20rem] text-[15px] leading-relaxed text-slate-500">
                {t.intro}
              </p>
            </>
          ) : shownName ? (
            <p className="mt-3 text-base font-semibold text-slate-900">{shownName}</p>
          ) : null}
        </header>

        <div className="flex-1">
          {sent ? (
            <ThankYou name={name} t={t} />
          ) : !showForm ? (
            <div className="grid auto-rows-fr gap-3.5">
              {/* auto-rows-fr: both cards always get the same height. */}
              <a href={`/p/${tagId}/google`} rel="nofollow" data-option="google" className={OPTION_CLASS}>
                <OptionContent icon={<GoogleGlyph />} title={t.googleTitle} text={t.googleText} />
              </a>
              <a
                href="?feedback=1"
                rel="nofollow"
                data-option="private"
                className={OPTION_CLASS}
                onClick={(event) => {
                  event.preventDefault();
                  setShowForm(true);
                }}
              >
                <OptionContent icon={<LockGlyph />} title={t.privateTitle} text={t.privateText} />
              </a>
            </div>
          ) : (
            <FeedbackForm
              name={name}
              legalName={legalName}
              t={t}
              result={actionData}
              sending={sending}
              onBack={() => setShowForm(false)}
            />
          )}
        </div>

        <PoweredBy label={t.poweredBy} />
      </main>
    </div>
  );
}

function BusinessMark({
  logo,
  background,
  name,
  alt,
  size,
}: {
  logo: string | null;
  background: string | null;
  name: string;
  alt: string;
  size: 'large' | 'small';
}) {
  // The form and thank-you screens keep the logo nearly as large.
  const box = size === 'large' ? 'h-28 w-28 rounded-[2rem]' : 'h-24 w-24 rounded-[1.75rem]';
  if (logo) {
    // A logo on a solid background fills the tile edge to edge, on that
    // colour; a transparent or light logo sits on white with padding.
    const padding = background ? '' : size === 'large' ? 'bg-white p-3' : 'bg-white p-2.5';
    return (
      <div
        style={background ? {backgroundColor: background} : undefined}
        className={`${box} ${padding} flex items-center justify-center overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 transition-all`}
      >
        <img src={logo} alt={alt} className="h-full w-full object-contain" />
      </div>
    );
  }
  const initial = name.trim().charAt(0).toUpperCase();
  if (!initial) return null;
  return (
    <div
      aria-hidden="true"
      className={`${box} flex items-center justify-center bg-[color:var(--brand)] font-serif text-[color:var(--brand-ink)] shadow-[0_12px_40px_rgba(15,23,42,0.15)] ${size === 'large' ? 'text-5xl' : 'text-4xl'} italic`}
    >
      {initial}
    </div>
  );
}

function OptionContent({icon, title, text}: {icon: ReactNode; title: string; text: string}) {
  return (
    <>
      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-[color:var(--brand-tint)] text-[color:var(--brand-text)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-bold leading-snug text-slate-900">{title}</span>
        <span className="mt-0.5 block text-sm text-slate-500">{text}</span>
      </span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-none text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500">
        <path fillRule="evenodd" d="M7.2 14.8a.75.75 0 0 1 0-1.06L10.94 10 7.2 6.26a.75.75 0 1 1 1.06-1.06l4.27 4.27a.75.75 0 0 1 0 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
      </svg>
    </>
  );
}

function FieldError({id, text}: {id: string; text: string}) {
  return (
    <p id={id} className={ERROR_TEXT_CLASS} role="alert">
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-none">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
      <span>{text}</span>
    </p>
  );
}

function FeedbackForm({
  name,
  legalName,
  t,
  result,
  sending,
  onBack,
}: {
  name: string;
  legalName: string;
  t: DualChoiceText;
  result: ActionResult;
  sending: boolean;
  onBack: () => void;
}) {
  const code = result?.error;
  const field: ErrorField | null = code ? ERROR_FIELD[code] ?? 'form' : null;
  const errorText = code ? t.errors[code] ?? t.errors.save_failed : '';
  const values = result?.values;
  // Ticking the box clears its error straight away.
  const [consentTicked, setConsentTicked] = useState(false);
  const show = (which: ErrorField) => field === which && !(which === 'consent' && consentTicked);

  // After a rejected post, bring the field with the problem into view. The
  // typed text stays: the inputs aren't reset, and without JavaScript the
  // values come back from the server.
  useEffect(() => {
    if (!result?.error) return;
    setConsentTicked(false);
    const target = document.getElementById(`field-${ERROR_FIELD[result.error] ?? 'form'}`);
    target?.scrollIntoView({behavior: 'smooth', block: 'center'});
    const focusable = target?.matches('input, textarea') ? target : target?.querySelector<HTMLElement>('input, textarea');
    focusable?.focus({preventScroll: true});
  }, [result]);

  return (
    <Form method="post" className="space-y-4 text-left" noValidate>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[color:var(--brand-tint)] text-[color:var(--brand-text)]">
            <LockGlyph />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">{t.formTitle}</h1>
            <p className="text-sm text-slate-500">{t.formIntro(name)}</p>
          </div>
        </div>

        {/* Honeypot: hidden from people, filled in by bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label htmlFor="field-message" className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t.messageLabel}
        </label>
        <textarea
          id="field-message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          defaultValue={values?.message}
          placeholder={t.messagePlaceholder}
          aria-invalid={show('message') || undefined}
          aria-describedby={show('message') ? 'error-message' : undefined}
          className={`${INPUT_CLASS} resize-none ${show('message') ? INPUT_INVALID_CLASS : ''}`}
        />
        {show('message') ? <FieldError id="error-message" text={errorText} /> : null}
      </div>

      <fieldset className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <legend className="sr-only">{t.contactLegend}</legend>
        <p className="text-sm font-semibold text-slate-700">
          {t.contactQuestion} <span className="font-normal text-slate-400">{t.optional}</span>
        </p>
        <div className="mt-3 space-y-2.5">
          <input
            type="text"
            name="contact_name"
            maxLength={100}
            autoComplete="name"
            defaultValue={values?.contactName}
            placeholder={t.namePlaceholder}
            aria-label={t.namePlaceholder}
            className={INPUT_CLASS}
          />
          <div>
            <input
              id="field-email"
              type="email"
              name="contact_email"
              maxLength={254}
              autoComplete="email"
              defaultValue={values?.contactEmail}
              placeholder={t.emailPlaceholder}
              aria-label={t.emailPlaceholder}
              aria-invalid={show('email') || undefined}
              aria-describedby={show('email') ? 'error-email' : undefined}
              className={`${INPUT_CLASS} ${show('email') ? INPUT_INVALID_CLASS : ''}`}
            />
            {show('email') ? <FieldError id="error-email" text={errorText} /> : null}
          </div>
          <div>
            <input
              id="field-phone"
              type="tel"
              name="contact_phone"
              maxLength={40}
              autoComplete="tel"
              defaultValue={values?.contactPhone}
              placeholder={t.phonePlaceholder}
              aria-label={t.phonePlaceholder}
              aria-invalid={show('phone') || undefined}
              aria-describedby={show('phone') ? 'error-phone' : undefined}
              className={`${INPUT_CLASS} ${show('phone') ? INPUT_INVALID_CLASS : ''}`}
            />
            {show('phone') ? <FieldError id="error-phone" text={errorText} /> : null}
          </div>
        </div>
        <div
          id="field-consent"
          className={`mt-4 rounded-2xl transition-colors ${show('consent') ? '-mx-2 border border-red-200 bg-red-50 p-3' : ''}`}
        >
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-slate-600">
            <input
              type="checkbox"
              name="contact_consent"
              value="yes"
              onChange={(event) => setConsentTicked(event.target.checked)}
              aria-invalid={show('consent') || undefined}
              aria-describedby={show('consent') ? 'error-consent' : undefined}
              className={`mt-0.5 h-5 w-5 flex-none rounded-md border-slate-300 accent-[color:var(--brand)] ${show('consent') ? 'outline outline-2 outline-offset-2 outline-red-500' : ''}`}
            />
            <span className={show('consent') ? 'text-slate-800' : undefined}>{t.consent(legalName)}</span>
          </label>
          {show('consent') ? <FieldError id="error-consent" text={errorText} /> : null}
        </div>
      </fieldset>

      {show('form') ? (
        <div id="field-form" className="rounded-2xl border border-red-100 bg-red-50 p-3">
          <FieldError id="error-form" text={errorText} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-[color:var(--brand)] py-4 text-base font-bold text-[color:var(--brand-ink)] shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-all hover:opacity-95 hover:shadow-[0_16px_36px_rgba(15,23,42,0.22)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--brand-ring)] disabled:opacity-70"
      >
        {sending ? t.sending : t.send}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-semibold text-slate-500 hover:text-slate-800"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.8 5.2a.75.75 0 0 1 0 1.06L9.06 10l3.74 3.74a.75.75 0 1 1-1.06 1.06L7.47 10.53a.75.75 0 0 1 0-1.06l4.27-4.27a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
        </svg>
        {t.back}
      </button>

      <p className="px-1 text-xs leading-relaxed text-slate-400">
        {t.privacyNote(legalName)}{' '}
        <a href="/privacy-policy" className="underline hover:text-slate-600">
          {t.privacyLink}
        </a>
      </p>
    </Form>
  );
}

function ThankYou({name, t}: {name: string; t: DualChoiceText}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)]" role="status">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-tint)] text-[color:var(--brand-text)]">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h1 className="mt-5 text-[1.75rem] font-semibold tracking-tight text-slate-900">
        {t.thanksBefore}
        <span className="font-serif italic text-[color:var(--brand-text)]">{t.thanksEmphasis}</span>
      </h1>
      <p className="mx-auto mt-2 max-w-[18rem] text-[15px] leading-relaxed text-slate-500">
        {t.thanksText(name)}
      </p>
    </div>
  );
}

function PoweredBy({label}: {label: string}) {
  return (
    <a
      href="https://flashbind.com/"
      className="mx-auto mt-8 inline-flex h-5 items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
    >
      {label}
      {/* Our mark (bolt + NFC waves), served from our own domain. */}
      <span className="inline-flex items-center gap-1">
        <img src="/favicon.svg" alt="" aria-hidden="true" width={15} height={18} className="h-[18px] w-auto" />
        <span className="text-[13px] font-bold tracking-tight text-slate-900">FlashBind</span>
      </span>
    </a>
  );
}

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.65 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.51Z" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5V7.75a4.5 4.5 0 1 1 9 0v2.75M6.75 10.5h10.5a1.5 1.5 0 0 1 1.5 1.5v6.75a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}
