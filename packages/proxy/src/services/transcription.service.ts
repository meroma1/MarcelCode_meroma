import OpenAI from 'openai';
import { logger } from '../config';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Please set it in docker/.env to enable audio transcription.');
    }
    openaiClient = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized for transcription');
  }
  return openaiClient;
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  try {
    const openai = getOpenAIClient();

    logger.info({ filename, size: audioBuffer.length }, 'Transcribing audio file');

    // Create a File object from the buffer
    // Uint8Array is used so TypeScript accepts it as BlobPart (Buffer has ArrayBufferLike which is not assignable to BlobPart)
    const part = new Uint8Array(audioBuffer);
    let file: File | Blob;
    if (typeof File !== 'undefined' && File.prototype.constructor) {
      file = new File([part], filename, {
        type: getMimeType(filename),
      });
    } else {
      file = new Blob([part], { type: getMimeType(filename) });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file as any, // OpenAI SDK accepts File, Blob, or ReadStream
      model: 'whisper-1',
      language: 'fr', // French by default, can be made configurable
    });

    const text = transcription.text;
    logger.info({ filename, textLength: text.length }, 'Audio transcription completed');

    return text;
  } catch (error: any) {
    logger.error({ error, filename }, 'Failed to transcribe audio');
    throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
  }
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    mp4: 'audio/mp4',
    mpeg: 'audio/mpeg',
    mpga: 'audio/mpeg',
    m4a: 'audio/mp4',
    wav: 'audio/wav',
    webm: 'audio/webm',
  };
  return mimeTypes[ext || ''] || 'audio/mpeg';
}
