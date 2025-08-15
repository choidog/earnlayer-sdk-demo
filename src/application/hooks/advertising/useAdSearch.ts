import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchAdsUseCase } from '../../usecases/advertising';
import type { AdSearchResult, Ad } from '../../usecases/advertising';
import type { AdvertisingConfig } from '../../../configuration/types';

/**
 * Hook for searching and managing contextual ads (replaces useMCPAds)
 */
export const useAdSearch = (config: AdvertisingConfig, conversationId?: string) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchResult, setLastSearchResult] = useState<AdSearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<AdSearchResult[]>([]);
  
  const searchUseCaseRef = useRef<SearchAdsUseCase | null>(null);
  const configRef = useRef(config);

  // Create use case when config changes
  useEffect(() => {
    if (JSON.stringify(configRef.current) === JSON.stringify(config)) {
      return;
    }

    configRef.current = config;
    
    searchUseCaseRef.current = new SearchAdsUseCase(
      config.mcpUrl,
      config.apiKey,
      config.creatorId
    );

    console.log('🔄 Ad search manager updated with new config');
  }, [config]);

  const searchAds = useCallback(async (
    queries: string[],
    options?: { conversationId?: string }
  ): Promise<AdSearchResult> => {
    if (!searchUseCaseRef.current) {
      throw new Error('Ad search use case not initialized');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for ads with queries:', queries);
      
      const searchConversationId = options?.conversationId || conversationId;
      const result = await searchUseCaseRef.current.execute(queries, searchConversationId);
      
      setAds(result.ads);
      setLastSearchResult(result);
      setSearchHistory(prev => [...prev.slice(-9), result]); // Keep last 10 searches
      
      console.log(`✅ Found ${result.ads.length} ads in ${result.responseTime}ms`);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ad search failed';
      setError(errorMessage);
      console.error('❌ Ad search failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const searchForMessage = useCallback(async (
    message: string,
    options?: { conversationId?: string }
  ): Promise<AdSearchResult> => {
    return searchAds([message], options);
  }, [searchAds]);

  const searchMultiple = useCallback(async (
    messages: string[],
    options?: { conversationId?: string }
  ): Promise<AdSearchResult> => {
    return searchAds(messages, options);
  }, [searchAds]);

  const clearAds = useCallback(() => {
    setAds([]);
    setLastSearchResult(null);
    setError(null);
    console.log('🔄 Ads cleared');
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    console.log('🔄 Search history cleared');
  }, []);

  const getAdsByType = useCallback((adType: string): Ad[] => {
    return ads.filter(ad => ad.ad_type === adType);
  }, [ads]);

  const getAdsByMinSimilarity = useCallback((minSimilarity: number): Ad[] => {
    return ads.filter(ad => ad.similarity >= minSimilarity);
  }, [ads]);

  const getSearchStats = useCallback(() => {
    return {
      totalSearches: searchHistory.length,
      totalAdsFound: searchHistory.reduce((sum, result) => sum + result.ads.length, 0),
      averageResponseTime: searchHistory.length > 0 
        ? searchHistory.reduce((sum, result) => sum + result.responseTime, 0) / searchHistory.length
        : 0,
      averageAdsPerSearch: searchHistory.length > 0
        ? searchHistory.reduce((sum, result) => sum + result.ads.length, 0) / searchHistory.length
        : 0,
      lastSearchTime: lastSearchResult?.timestamp
    };
  }, [searchHistory, lastSearchResult]);

  const getConfiguration = useCallback(() => {
    return searchUseCaseRef.current?.getConfiguration() || null;
  }, []);

  return {
    // Ad state
    ads,
    isLoading,
    error,
    
    // Search results
    lastSearchResult,
    searchHistory,
    
    // Actions
    searchAds,
    searchForMessage,
    searchMultiple,
    clearAds,
    clearHistory,
    
    // Filtering and analysis
    getAdsByType,
    getAdsByMinSimilarity,
    getSearchStats,
    
    // Configuration
    getConfiguration,
    creatorId: config.creatorId,
    mcpUrl: config.mcpUrl,
    
    // Status helpers
    hasAds: ads.length > 0,
    hasError: error !== null,
    isHealthy: error === null && searchUseCaseRef.current !== null,
    
    // Metrics
    adCount: ads.length,
    lastResponseTime: lastSearchResult?.responseTime,
    lastSearchTimestamp: lastSearchResult?.timestamp
  };
};