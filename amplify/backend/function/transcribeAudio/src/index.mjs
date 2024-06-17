import OpenAI from 'openai';
import { toFile } from 'openai';

const openai = new OpenAI({auth: process.env.OPENAI_API_KEY});

export async function transcribeAudio(
  source,
  timestamp,
  blob,
) {
  try {
    const file = await toFile(blob, 'tmp.mp3', { type: 'audio/mp3' });
    console.log('file', file);
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });
    if (transcription.text.length > 13) {
      const parsedTranscription = {
        source,
        timestamp,
        text: transcription.text,
      };
      return parsedTranscription;
    }
  } catch (error) {
    console.error('Error during transcription: ', error);
  }
  return null;
}
