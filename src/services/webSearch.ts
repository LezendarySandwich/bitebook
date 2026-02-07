import * as searchCacheRepo from '../db/repositories/searchCacheRepository';

interface SearchResult {
  title: string;
  snippet: string;
}

export async function searchWeb(query: string): Promise<string> {
  // Check cache first
  const cached = await searchCacheRepo.getCachedSearch(query);
  if (cached) {
    return cached;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`);
    }

    const html = await response.text();
    const results = parseSearchResults(html);

    if (results.length === 0) {
      return `No search results found for "${query}".`;
    }

    const formatted = results
      .slice(0, 5)
      .map((r) => `${r.title}: ${r.snippet}`)
      .join('\n\n');

    // Cache the results
    await searchCacheRepo.setCachedSearch(query, formatted);

    return formatted;
  } catch (error) {
    // Fallback: return a generic message
    return `Could not search for "${query}". Please estimate the calorie count based on your knowledge.`;
  }
}

function parseSearchResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Pattern 1: DuckDuckGo result blocks
  const resultPattern =
    /<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let match: RegExpExecArray | null;
  while ((match = resultPattern.exec(html)) !== null) {
    const title = stripHtml(match[1]).trim();
    const snippet = stripHtml(match[2]).trim();
    if (title && snippet) {
      results.push({ title, snippet });
    }
  }

  // Pattern 2: Fallback - simpler snippet extraction
  if (results.length === 0) {
    const snippetPattern =
      /class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div)>/g;
    while ((match = snippetPattern.exec(html)) !== null) {
      const snippet = stripHtml(match[1]).trim();
      if (snippet.length > 20) {
        results.push({ title: 'Search Result', snippet });
      }
    }
  }

  return results;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
