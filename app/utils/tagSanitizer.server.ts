/**
 * Server-only utility for sanitizing untrusted tag settings from the database
 * before serialization to the public browser.
 */

export function sanitizeTagSettings(type: unknown, settings: unknown): Record<string, string> {
  // Verify settings is a non-null object
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    return {};
  }

  const safeSettings: Record<string, string> = {};
  const raw = settings as Record<string, unknown>;

  if (type === 'pet_tag') {
    // Pet tags require no public settings
    return safeSettings;
  } 
  
  if (type === 'wifi') {
    // Wi-Fi tags may only expose network credentials
    if (typeof raw.network_name === 'string') {
      safeSettings.network_name = raw.network_name;
    }
    if (typeof raw.network_password === 'string') {
      safeSettings.network_password = raw.network_password;
    }
    return safeSettings;
  } 
  
  if (type === 'google_review' || type === 'menu') {
    // Review and menu tags may only expose the destination URL
    if (typeof raw.destination_url === 'string') {
      safeSettings.destination_url = raw.destination_url;
    }
    return safeSettings;
  }

  // Unknown or future tag types return an empty object safely
  return safeSettings;
}
