export interface GenerateDraftsParams {
  companyName: string;
  services: { name: string; description?: string | null; reviewContext?: string | null }[];
  employeeName?: string | null;
  clientNotes?: string | null;
}

export interface GenerateDraftsResult {
  suggestions: string[];
  provider: 'groq' | 'fallback';
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
}

/**
 * Generates contextually grounded fallback drafts when Groq API key is not configured or during outages.
 */
function generateContextualFallbackDrafts(params: GenerateDraftsParams): string[] {
  const serviceList = (params.services && params.services.length > 0)
    ? params.services.map((s) => s.name).join(' and ')
    : 'our business needs';
  const company = params.companyName || 'the team';
  const employeeMention = params.employeeName ? ` Working with ${params.employeeName} was a pleasure.` : '';
  const noteMention = params.clientNotes ? ` ${params.clientNotes}.` : '';

  return [
    `Had a great experience working with ${company} for ${serviceList}. The team was professional, attentive, and delivered exceptional results.${employeeMention}`,
    `Very impressed with the quality of service from ${params.companyName}. They handled our ${serviceList} with clear communication and thorough expertise.${noteMention} Highly recommend their work!`,
    `Seamless process and timely support throughout our ${serviceList} project with ${params.companyName}.${employeeMention} The attention to detail made all the difference.`
  ];
}

/**
 * Calls Groq API with prompt engineering adhering to Spec §9 (factual grounding only, no hallucinations).
 */
export async function generateReviewDrafts(params: GenerateDraftsParams): Promise<GenerateDraftsResult> {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    const suggestions = generateContextualFallbackDrafts(params);
    return {
      suggestions,
      provider: 'fallback',
      latencyMs: Date.now() - startTime
    };
  }

  const serviceContextDetails = params.services
    .map((s) => `- ${s.name}${s.reviewContext ? `: ${s.reviewContext}` : s.description ? `: ${s.description}` : ''}`)
    .join('\n');

  const systemPrompt = `You are a helpful assistant for authentic client review drafting for "${params.companyName}".
Your mission is to generate up to 3 distinct, genuine, and natural-sounding review draft suggestions that a client can edit or use on Google.

CRITICAL POLICY & ACCURACY RULES:
1. ONLY refer to the services explicitly listed below. NEVER invent other services, certifications, guarantees, or specific financial ROI numbers.
2. If an employee name is provided (${params.employeeName || 'None'}), you may optionally include a respectful mention, but keep it natural.
3. If the client provided optional notes or highlights, incorporate them naturally.
4. Provide exactly 3 distinct suggestions with varying lengths and styles:
   - Suggestion 1: Concise and direct (2-3 sentences).
   - Suggestion 2: Detailed and service-focused (3-4 sentences).
   - Suggestion 3: Warm and team-oriented (2-3 sentences).
5. Output ONLY valid JSON in the following format:
{
  "suggestions": [
    "First draft...",
    "Second draft...",
    "Third draft..."
  ]
}`;

  const userPrompt = `Company: ${params.companyName}
Delivered Services:
${serviceContextDetails}
${params.employeeName ? `Assisting Team Member: ${params.employeeName}` : ''}
${params.clientNotes ? `Client's Specific Highlights: "${params.clientNotes}"` : ''}

Generate 3 authentic review suggestions in JSON format.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    // Try configured model or fast versatile Groq model
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Groq API error (${response.status}): falling back to contextual drafts.`);
      return {
        suggestions: generateContextualFallbackDrafts(params),
        provider: 'fallback',
        latencyMs: Date.now() - startTime
      };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
      return {
        suggestions: parsed.suggestions.slice(0, 3),
        provider: 'groq',
        latencyMs: Date.now() - startTime,
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens
      };
    }

    return {
      suggestions: generateContextualFallbackDrafts(params),
      provider: 'fallback',
      latencyMs: Date.now() - startTime
    };
  } catch (err) {
    console.warn('Groq generation failed or timed out:', err);
    return {
      suggestions: generateContextualFallbackDrafts(params),
      provider: 'fallback',
      latencyMs: Date.now() - startTime
    };
  }
}
