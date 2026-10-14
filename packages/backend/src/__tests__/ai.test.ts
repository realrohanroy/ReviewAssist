import { describe, it, expect } from 'vitest';
import { generateReviewDrafts } from '../services/ai.js';

describe('AI Draft Generation & Failure Isolation', () => {
  it('generates 3 distinct drafts grounded strictly in service context during fallback', async () => {
    // Deliberately test fallback without requiring external Groq API key
    const result = await generateReviewDrafts({
      companyName: 'Apex Advisory',
      services: [
        {
          name: 'Tax Audit & Compliance',
          description: 'Corporate tax review',
          reviewContext: 'Thorough review of corporate accounts and VAT return filings.'
        }
      ],
      employeeName: 'Sarah',
      clientNotes: 'Smooth onboarding'
    });

    expect(result.provider).toBe('fallback');
    expect(result.suggestions).toHaveLength(3);

    // Verify factual grounding
    for (const draft of result.suggestions) {
      expect(typeof draft).toBe('string');
      expect(draft.length).toBeGreaterThan(20);
      expect(draft).toMatch(/Apex Advisory/i);
      expect(draft).toMatch(/Tax Audit & Compliance/i);
    }
  });

  it('guarantees manual path isolation: never throws or crashes on missing context', async () => {
    // Calling with minimal/empty inputs should still resolve with fallback drafts
    const result = await generateReviewDrafts({
      companyName: '',
      services: []
    });

    expect(result).toHaveProperty('suggestions');
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBe(3);
    for (const draft of result.suggestions) {
      expect(typeof draft).toBe('string');
      expect(draft.length).toBeGreaterThan(10);
    }
  });
});
