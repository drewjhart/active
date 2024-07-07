import OpenAI, { toFile } from 'openai';

const openai = new OpenAI({auth: process.env.OPENAI_API_KEY});

export async function handler(event) {
  console.log(event.body);
  const body = JSON.parse(event.body);
  const { source, timestamp, base64Blob } = body;
  const buffer = Buffer.from(base64Blob, 'base64');
  const newBlob = new Blob([buffer], { type: 'audio/mp3' });
  const file = await toFile(newBlob, 'tmp.mp3', { type: 'audio/mp3' });

  try {
    const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'text',
    });
    
    if (transcription.length > 13) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          source,
          timestamp,
          text: transcription.replace(/(\r\n|\n|\r)/gm, ""),
        }),
      };
    }
  } catch (error) {
    console.error(error);
    // Handle any errors
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error processing your request' }),
    };
  }
}
