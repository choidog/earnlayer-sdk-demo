/**
 * Use case for searching and retrieving contextual ads
 */
export class SearchAdsUseCase {
  constructor(
    private mcpUrl: string,
    private apiKey: string,
    private creatorId: string
  ) {}

  async execute(queries: string[], conversationId?: string): Promise<AdSearchResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Searching ads for queries:`, queries);

      // Build search request
      const searchRequest = {
        queries,
        creator_id: this.creatorId,
        conversation_id: conversationId
      };

      // Make request to MCP server
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        throw new Error(`MCP server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const result: AdSearchResult = {
        ads: data.results || [],
        query: queries.join(' '),
        responseTime,
        timestamp: new Date(),
        metadata: {
          conversationId,
          creatorId: this.creatorId,
          queryCount: queries.length
        }
      };

      console.log(`✅ Found ${result.ads.length} ads (${responseTime}ms)`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Ad search failed (${responseTime}ms):`, error);
      
      throw new AdSearchError(
        `Failed to search ads: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async executeForMessage(message: string, conversationId?: string): Promise<AdSearchResult> {
    return this.execute([message], conversationId);
  }

  async executeMultiple(
    messageQueries: string[], 
    conversationId?: string
  ): Promise<AdSearchResult> {
    return this.execute(messageQueries, conversationId);
  }

  getConfiguration() {
    return {
      mcpUrl: this.mcpUrl,
      creatorId: this.creatorId,
      apiKey: this.apiKey ? '***configured***' : 'not configured'
    };
  }
}

export interface AdSearchResult {
  ads: Ad[];
  query: string;
  responseTime: number;
  timestamp: Date;
  metadata: {
    conversationId?: string;
    creatorId: string;
    queryCount: number;
  };
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  url: string;
  ad_type: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export class AdSearchError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AdSearchError';
  }
}