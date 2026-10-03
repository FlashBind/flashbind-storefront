/**
 * Texts of the public Dual Choice page, in Lithuanian and English.
 *
 * The page follows the visitor's phone language when it is Lithuanian or
 * English, otherwise the business's default (business_entitlements.page_language).
 *
 * Lithuanian texts use the business name only where it stays in the
 * nominative case, so names like "UAB Stasmila" never need inflecting.
 */

export type PageLanguage = 'lt' | 'en';
export const PAGE_LANGUAGES: PageLanguage[] = ['lt', 'en'];
export const DEFAULT_PAGE_LANGUAGE: PageLanguage = 'lt';

export function normalizePageLanguage(value: unknown): PageLanguage | null {
  return value === 'lt' || value === 'en' ? value : null;
}

/**
 * The visitor's preferred language from an Accept-Language header (the
 * phone's language comes first), if it is Lithuanian or English; otherwise
 * the business default.
 */
export function pickPageLanguage(acceptLanguage: string | null | undefined, fallback: PageLanguage): PageLanguage {
  if (!acceptLanguage) return fallback;
  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? Number(q.slice(2)) : 1;
      return {primary: tag.trim().toLowerCase().split('-')[0], weight: Number.isFinite(weight) ? weight : 0, index};
    })
    .filter((entry) => entry.primary && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return normalizePageLanguage(ranked[0]?.primary) ?? fallback;
}

/** Error codes the feedback form can return; the page shows them in its language. */
export type FeedbackErrorCode =
  | 'message_required'
  | 'message_too_long'
  | 'email_invalid'
  | 'phone_invalid'
  | 'consent_required'
  | 'rate_limited'
  | 'save_failed';

export type DualChoiceText = {
  fallbackName: string;
  logoAlt: (name: string) => string;
  headline: string;
  intro: string;
  googleTitle: string;
  googleText: string;
  privateTitle: string;
  privateText: string;
  formTitle: string;
  formIntro: (name: string) => string;
  messageLabel: string;
  messagePlaceholder: string;
  contactLegend: string;
  contactQuestion: string;
  optional: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  consent: (name: string) => string;
  send: string;
  sending: string;
  back: string;
  privacyNote: (name: string) => string;
  privacyLink: string;
  thanksBefore: string;
  thanksEmphasis: string;
  thanksText: (name: string) => string;
  poweredBy: string;
  errors: Record<FeedbackErrorCode, string>;
};

const EN: DualChoiceText = {
  fallbackName: 'this business',
  logoAlt: (name) => `${name} logo`,
  headline: 'Thanks for visiting!',
  intro: 'Share your experience publicly on Google, or privately with the team.',
  googleTitle: 'Leave a Google review',
  googleText: 'Share publicly on Google',
  privateTitle: 'Send private feedback',
  privateText: 'Reaches the team instantly',
  formTitle: 'Private feedback',
  formIntro: (name) => `Only the team at ${name} sees this.`,
  messageLabel: 'Your message',
  messagePlaceholder: 'Tell the team what went well or what could be better…',
  contactLegend: 'Contact details (optional)',
  contactQuestion: 'Want a reply?',
  optional: 'Optional',
  namePlaceholder: 'Name',
  emailPlaceholder: 'Email',
  phonePlaceholder: 'Phone',
  consent: (name) => `${name} may contact me about this.`,
  send: 'Send privately',
  sending: 'Sending…',
  back: 'Back',
  privacyNote: (name) =>
    `${name} receives your message through FlashBind. Please don't include sensitive personal information. Contact details are only saved if you tick the box. Messages are deleted after 12 months.`,
  privacyLink: 'Privacy Policy',
  thanksBefore: 'Thank ',
  thanksEmphasis: 'you',
  thanksText: (name) => `Your message was sent privately to the team at ${name}.`,
  poweredBy: 'Powered by',
  errors: {
    message_required: 'Please write a message.',
    message_too_long: 'Please keep your message under 2,000 characters.',
    email_invalid: 'Please check the email address, or leave it empty.',
    phone_invalid: 'Please check the phone number, or leave it empty.',
    consent_required: 'To leave contact details, tick the box so the business may contact you. Or leave them empty.',
    rate_limited: 'Too many messages were sent just now. Please try again later.',
    save_failed: 'Something went wrong. Please try again.',
  },
};

const LT: DualChoiceText = {
  fallbackName: 'Verslas',
  logoAlt: () => 'Logotipas',
  headline: 'Ačiū, kad apsilankėte!',
  intro: 'Pasidalykite įspūdžiais viešai „Google“ arba privačiai su komanda.',
  // Short enough for one line on a 375 px phone (measured 184 px of 201 px).
  googleTitle: 'Atsiliepimas „Google“',
  googleText: 'Viešai, matys visi',
  privateTitle: 'Parašykite privačiai',
  privateText: 'Iškart pasieks komandą',
  formTitle: 'Privatus atsiliepimas',
  formIntro: () => 'Jūsų žinutę matys tik šios vietos komanda.',
  messageLabel: 'Jūsų žinutė',
  messagePlaceholder: 'Parašykite, kas patiko ir ką būtų galima pagerinti…',
  contactLegend: 'Kontaktai (neprivaloma)',
  contactQuestion: 'Norite atsakymo?',
  optional: 'Neprivaloma',
  namePlaceholder: 'Vardas',
  emailPlaceholder: 'El. paštas',
  phonePlaceholder: 'Telefonas',
  consent: (name) => `Sutinku, kad ${name} su manimi susisiektų dėl šio atsiliepimo.`,
  send: 'Siųsti privačiai',
  sending: 'Siunčiama…',
  back: 'Atgal',
  privacyNote: (name) =>
    `${name} jūsų žinutę gauna per FlashBind. Nerašykite jautrios asmeninės informacijos. Kontaktai išsaugomi tik pažymėjus langelį. Žinutės ištrinamos po 12 mėnesių.`,
  privacyLink: 'Privatumo politika',
  thanksBefore: '',
  thanksEmphasis: 'Ačiū!',
  thanksText: () => 'Jūsų žinutė išsiųsta privačiai. Ją matys tik komanda.',
  poweredBy: 'Veikia su',
  errors: {
    message_required: 'Parašykite žinutę.',
    message_too_long: 'Žinutė per ilga: ne daugiau kaip 2 000 simbolių.',
    email_invalid: 'Patikrinkite el. pašto adresą arba palikite lauką tuščią.',
    phone_invalid: 'Patikrinkite telefono numerį arba palikite lauką tuščią.',
    consent_required: 'Jei paliekate kontaktus, pažymėkite langelį, kad su jumis būtų galima susisiekti. Arba palikite laukus tuščius.',
    rate_limited: 'Ką tik išsiųsta per daug žinučių. Bandykite šiek tiek vėliau.',
    save_failed: 'Nepavyko išsiųsti. Bandykite dar kartą.',
  },
};

export const DUAL_CHOICE_TEXT: Record<PageLanguage, DualChoiceText> = {en: EN, lt: LT};
