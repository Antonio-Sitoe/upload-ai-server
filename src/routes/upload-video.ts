import { FastifyInstance } from 'fastify';
import { fastifyMultipart } from '@fastify/multipart';
import { pipeline } from 'node:stream';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { promisify } from 'node:util';
import fs from 'node:fs';
import { prisma } from '../lib/prisma';

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25mb
    },
  });
  app.post('/videos', async (request, replay) => {
    const data = await request.file();
    if (!data) {
      return replay.status(400).send({
        error: 'Faltando o arquivo',
      });
    }
    const extension = path.extname(data.filename);

    if (extension !== '.mp3') {
      return replay.status(400).send({
        error: 'Invalido',
      });
    }

    const fileBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;
    const uploadDir = path.resolve(__dirname, '../../temp', fileUploadName);
    await pump(data.file, fs.createWriteStream(uploadDir));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDir,
      },
    });
    return {
      video,
    };
  });
}
