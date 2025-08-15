/**
 * Core AI domain types
 */

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  id: string;
  content: string;
  conversationId: string;
  source: string;
  metadata?: {
    model?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    provider?: string;
    responseTime?: number;
    [key: string]: any;
  };
}

export interface AIStreamEvent {
  type: 'start' | 'chunk' | 'end' | 'error' | 'metadata';
  data?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class AIMessageEntity {
  public readonly id: string;
  public readonly content: string;
  public readonly role: 'user' | 'assistant' | 'system';
  public readonly timestamp: Date;
  public readonly metadata: Record<string, any>;

  constructor(
    id: string,
    content: string,
    role: 'user' | 'assistant' | 'system',
    timestamp: Date = new Date(),
    metadata: Record<string, any> = {}
  ) {
    this.id = id;
    this.content = content;
    this.role = role;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }

  static createUserMessage(content: string, metadata?: Record<string, any>): AIMessageEntity {
    return new AIMessageEntity(
      this.generateId(),
      content,
      'user',
      new Date(),
      metadata
    );
  }

  static createAssistantMessage(content: string, metadata?: Record<string, any>): AIMessageEntity {
    return new AIMessageEntity(
      this.generateId(),
      content,
      'assistant',
      new Date(),
      metadata
    );
  }

  static createSystemMessage(content: string, metadata?: Record<string, any>): AIMessageEntity {
    return new AIMessageEntity(
      this.generateId(),
      content,
      'system',
      new Date(),
      metadata
    );
  }

  private static generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): AIMessage {
    return {
      id: this.id,
      content: this.content,
      role: this.role,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
}

export class AIResponseEntity {
  public readonly id: string;
  public readonly content: string;
  public readonly conversationId: string;
  public readonly source: string;
  public readonly metadata: Record<string, any>;

  constructor(
    id: string,
    content: string,
    conversationId: string,
    source: string,
    metadata: Record<string, any> = {}
  ) {
    this.id = id;
    this.content = content;
    this.conversationId = conversationId;
    this.source = source;
    this.metadata = metadata;
  }

  static create(
    content: string,
    conversationId: string,
    source: string,
    metadata?: Record<string, any>
  ): AIResponseEntity {
    return new AIResponseEntity(
      this.generateId(),
      content,
      conversationId,
      source,
      metadata
    );
  }

  private static generateId(): string {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): AIResponse {
    return {
      id: this.id,
      content: this.content,
      conversationId: this.conversationId,
      source: this.source,
      metadata: this.metadata
    };
  }
}