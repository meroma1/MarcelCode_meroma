import Anthropic from '@anthropic-ai/sdk';
import { env, logger } from '../config';
import { ModelId } from '@marcelia/shared';

let client: Anthropic;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey || apiKey === 'sk-ant-your-api-key-here' || apiKey.length < 20) {
      logger.error({ 
        apiKeyPrefix: apiKey?.substring(0, 15) + '...',
        apiKeyLength: apiKey?.length,
        hasValue: !!apiKey,
      }, 'Invalid or missing ANTHROPIC_API_KEY');
      throw new Error('ANTHROPIC_API_KEY is missing or invalid. Please set a valid API key in docker/.env');
    }
    // Log the key prefix and length for debugging (without exposing the full key)
    logger.info({ 
      apiKeyPrefix: apiKey.substring(0, 20) + '...',
      apiKeyLength: apiKey.length,
      apiKeyStartsCorrectly: apiKey.startsWith('sk-ant-api03-'),
    }, 'Initializing Anthropic client');
    client = new Anthropic({
      apiKey,
    });
    logger.info({ apiKeyPrefix: apiKey.substring(0, 20) + '...' }, 'Anthropic client initialized (direct API)');
  }
  return client;
}

export interface FoundryStreamOptions {
  model: ModelId;
  messages: Array<{ role: string; content: any }>;
  maxTokens: number;
  systemPrompt?: string;
  tools?: Array<{ name: string; description: string; input_schema: any }>;
}

export async function createStream(options: FoundryStreamOptions) {
  const anthropic = getClient();

  const params: any = {
    model: options.model,
    max_tokens: options.maxTokens,
    system: options.systemPrompt || undefined,
    messages: options.messages,
  };

  if (options.tools && options.tools.length > 0) {
    params.tools = options.tools;
  }

  try {
    const stream = anthropic.messages.stream(params);
    return stream;
  } catch (err: any) {
    logger.error({ 
      err, 
      model: options.model,
      apiKeyPrefix: env.ANTHROPIC_API_KEY?.substring(0, 15) + '...',
      errorMessage: err?.message,
      errorStatus: err?.status,
      errorCode: err?.code,
    }, 'Failed to create Anthropic stream');
    throw err;
  }
}

export async function createMessage(options: FoundryStreamOptions) {
  const anthropic = getClient();

  const params: any = {
    model: options.model,
    max_tokens: options.maxTokens,
    system: options.systemPrompt || undefined,
    messages: options.messages,
  };

  if (options.tools && options.tools.length > 0) {
    params.tools = options.tools;
  }

  const response = await anthropic.messages.create(params);

  return response;
}
