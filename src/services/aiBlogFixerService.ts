export interface AiFixerRequest {
  title: string;
  excerpt: string;
  content: string;
  model?: string;
  mode?: 'grammar' | 'formatting' | 'full';
  customRules?: string;
}

export interface AiFixerResponse {
  improvedTitle: string;
  improvedExcerpt: string;
  improvedContent: string;
  changesSummary: string[];
  rawResponse?: string;
}

export const AVAILABLE_AI_MODELS = [
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (Free - Recommended)', default: true },
  { id: 'poolside/laguna-s-2.1:free', name: 'Poolside Laguna S 2.1 (Free)' },
  { id: 'openrouter/free', name: 'OpenRouter Free Auto (Free)' }
];

export async function fixBlogContentWithAI(req: AiFixerRequest): Promise<AiFixerResponse> {
  const modelToUse = req.model || 'google/gemma-4-26b-a4b-it:free';

  try {
    // Route through server-side /api/fix-blog proxy to keep API keys strictly off the client.
    // The server only serves active staff, so send the session token for it to verify.
    const { supabase } = await import('../lib/supabase');
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const response = await fetch('/api/fix-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        ...req,
        model: modelToUse,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${response.status}`);
    }

    const data: AiFixerResponse = await response.json();
    return {
      improvedTitle: data.improvedTitle || req.title,
      improvedExcerpt: data.improvedExcerpt || req.excerpt,
      improvedContent: data.improvedContent || req.content,
      changesSummary: Array.isArray(data.changesSummary) ? data.changesSummary : ['Content reviewed and polished.'],
      rawResponse: data.rawResponse
    };

  } catch (err: any) {
    console.warn('AI Blog Fixer proxy notice:', err.message);
    // Graceful offline fallback: keep original content safe
    return {
      improvedTitle: req.title,
      improvedExcerpt: req.excerpt,
      improvedContent: req.content,
      changesSummary: ['AI Assistant service notice: ' + (err.message || 'Original article preserved.')],
    };
  }
}
