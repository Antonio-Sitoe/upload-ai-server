import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { get_all_prompts } from './routes/get-all-prompts';
import { uploadVideoRoute } from './routes/upload-video';
import { generate_ai_completion } from './routes/generate-ai-completion';
import { create_transcription } from './routes/create-transcrition';

const app = fastify();
app.register(fastifyCors, {
  origin: '*',
});

app.register(get_all_prompts);
app.register(uploadVideoRoute);
app.register(generate_ai_completion);
app.register(create_transcription);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running');
  });
