import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { createReadStream } from 'fs';
import { openai } from '../lib/openai';

export async function create_transcription(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (req) => {
    const schema = z.object({
      videoId: z.string().uuid(),
    });
    const bodySchema = z.object({
      prompt: z.string(),
    });
    const { videoId } = schema.parse(req.params);
    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const videoPath = video.path;
    const audioReadSTream = createReadStream(videoPath);
    const response = await openai.audio.transcriptions.create({
      file: audioReadSTream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    });

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription: response.text,
      },
    });
  });
}
