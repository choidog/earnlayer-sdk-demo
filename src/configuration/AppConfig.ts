import type { AppConfig } from './types';
import { ConfigFactory } from './ConfigFactory';
import { ConfigValidator } from './ConfigValidator';

/**
 * Central configuration management for the EarnLayer SDK Demo
 */
export class AppConfigManager {
  private static instance: AppConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = ConfigFactory.createFromEnvironment();
  }

  public static getInstance(): AppConfigManager {
    if (!AppConfigManager.instance) {
      AppConfigManager.instance = new AppConfigManager();
    }
    return AppConfigManager.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
    ConfigValidator.validate(this.config);
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public getAIProvider(): string {
    return this.config.ai.provider;
  }

  public getAIConfig() {
    return this.config.ai;
  }

  public getAdvertisingConfig() {
    return this.config.advertising;
  }

  public getConversationConfig() {
    return this.config.conversation;
  }

  public getApiConfig() {
    return this.config.api;
  }

  public reset(): void {
    this.config = ConfigFactory.createFromEnvironment();
  }

  public static createTestConfig(): AppConfig {
    return ConfigFactory.createDevelopmentConfig();
  }
}

// Export singleton instance
export const appConfig = AppConfigManager.getInstance();