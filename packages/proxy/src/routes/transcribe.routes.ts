import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/transcription.service';
import { logger } from '../config';

const router = Router();

// Configure multer for memory storage (we'll send buffer to OpenAI)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (OpenAI Whisper limit)
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp4',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/x-m4a',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
        code: 'MISSING_FILE',
        statusCode: 400,
        requestId,
      });
    }

    const { buffer, originalname } = req.file;
    const transcription = await transcribeAudio(buffer, originalname);

    res.json({
      transcription,
      filename: originalname,
      requestId,
    });
  } catch (error: any) {
    logger.error({ error, requestId }, 'Transcription route error');
    res.status(500).json({
      error: error.message || 'Transcription failed',
      code: 'TRANSCRIPTION_ERROR',
      statusCode: 500,
      requestId,
    });
  }
});

export { router as transcribeRoutes };
