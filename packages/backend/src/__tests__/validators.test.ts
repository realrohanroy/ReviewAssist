import { describe, it, expect } from 'vitest';
import { isValidGoogleReviewUrl } from '../utils/validators.js';

describe('Google Review URL Validation', () => {
  it('accepts authentic HTTPS Google review URLs across all official domains', () => {
    const validUrls = [
      'https://g.page/r/CQggM93k8GK1EBM/review',
      'https://share.google/e4usbIO2ZeN9ezVlF',
      'https://g.page/r/Cb1X9_example/review',
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      'https://maps.google.com/place/SME+Experts/@37.7749,-122.4194',
      'https://goo.gl/maps/AbcDef123',
      'https://www.google.com/maps/place/SME+Experts'
    ];

    for (const url of validUrls) {
      const isValid = isValidGoogleReviewUrl(url);
      expect(isValid, `Expected valid for: ${url}`).toBe(true);
    }
  });

  it('rejects insecure non-HTTPS protocols', () => {
    const insecureUrls = [
      'http://g.page/r/example/review',
      'http://search.google.com/local/writereview?placeid=123',
      'http://maps.google.com'
    ];

    for (const url of insecureUrls) {
      const isValid = isValidGoogleReviewUrl(url);
      expect(isValid).toBe(false);
    }
  });

  it('rejects non-Google domains and phishing spoofs', () => {
    const invalidDomains = [
      'https://facebook.com/reviews',
      'https://trustpilot.com/evaluate/smeexperts',
      'https://google.spoof-domain.com/review',
      'https://myfakegoogle.com/g.page',
      'https://evil.com?redirect=google.com'
    ];

    for (const url of invalidDomains) {
      const isValid = isValidGoogleReviewUrl(url);
      expect(isValid, `Expected invalid for: ${url}`).toBe(false);
    }
  });

  it('rejects malformed inputs and empty strings', () => {
    const malformed = ['', '   ', 'not-a-url', 'ftp://google.com'];

    for (const item of malformed) {
      const isValid = isValidGoogleReviewUrl(item);
      expect(isValid).toBe(false);
    }
  });
});
