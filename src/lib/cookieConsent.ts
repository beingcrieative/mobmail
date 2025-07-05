// List of essential cookies that should never be deleted
export const essentialCookies = ['userId', 'userEmail', 'authToken', 'sb-auth-token'];

/**
 * Get the current cookie consent status
 * @returns 'accepted' | 'declined' | null
 */
export const getCookieConsent = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cookieConsent');
};

/**
 * Set cookie consent preference
 * @param status 'accepted' | 'declined'
 */
export const setCookieConsent = (status: 'accepted' | 'declined'): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookieConsent', status);
  
  if (status === 'declined') {
    clearNonEssentialCookies();
  }
};

/**
 * Clear all non-essential cookies
 */
export const clearNonEssentialCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=').map(part => part.trim());
    if (name && !essentialCookies.includes(name)) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
}; 