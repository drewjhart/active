import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import {Buffer} from 'buffer';
import OpenAI, { toFile } from 'openai';
import { SourceType, ParsedTranscriptionType, ParsedIssueType } from '../types/types';

enum HTTPMethod {
  Post = "POST",
}

const transcribeAudioEndpoint = 'https://dtuswdnje8.execute-api.us-east-1.amazonaws.com/default/transcribeAudio-dev';
const analyzeConversationEndpoint = 'https://041mbz10v3.execute-api.us-east-1.amazonaws.com/analyzeConversation/analyzeConversation-dev';

export class openAIAPI {
  private analyzeConversationEndpoint: string;
  private transcribeAudioEndpoint: string;
  constructor() {
    this.analyzeConversationEndpoint = analyzeConversationEndpoint;
    this.transcribeAudioEndpoint = transcribeAudioEndpoint;
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Result = base64String.split(',')[1];
        resolve(base64Result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async transcribeAudioRequest(
    source: SourceType,
    timestamp: number,
    blob: Blob,
  ):Promise<ParsedTranscriptionType> {
      // try { 
      //   const base64Blob = await this.convertBlobToBase64(blob);
      //   const event = JSON.stringify({
      //     source,
      //     timestamp,
      //     base64Blob
      //   });
      //   const buffer = Buffer.from(base64Blob, 'base64');
      //   const newBlob = new Blob([buffer], { type: 'audio/mp3' });
      //   const file = await toFile(newBlob, 'tmp.mp3', { type: 'audio/mp3' });
      //   console.log('file', file);
      //   const transcription = await openai.audio.transcriptions.create({
      //     file,
      //     model: 'whisper-1',
      //     language: 'en',
      //   });
      //   if (transcription.text.length > 13) {
      //     const parsedTranscription: ParsedTranscriptionType = {
      //       source,
      //       timestamp,
      //       text: transcription.text,
      //     };
      //     console.log('parsedTranscription', parsedTranscription);
      //     return parsedTranscription;
      //   }
      // } catch (error) {
      //   console.error('Error during transcription: ', error);
      // }

    const base64Blob = await this.convertBlobToBase64(blob);
    try {
      const attempt = fetch(this.transcribeAudioEndpoint, {
        method: HTTPMethod.Post,
        headers: {
            "content-type": "application/json",
            connection: "close",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
            source,
            timestamp,
            base64Blob
        }),
    })
    .then((response) => {
        if (!response.ok) {
          console.error(response.statusText)
        }
        console.log(response);
        return response.json()
    });
    
    return attempt;
    } catch (e) {
        console.log(e)
    }
    return {source: SourceType.VOICE_ONE, timestamp: 0, text: ''};
  }

  async analyzeConversationRequest(
    bufferArray: ParsedTranscriptionType[],
  ):Promise<ParsedIssueType | null> {
      try { 
      const attempt = fetch(this.analyzeConversationEndpoint, {
          method: "POST",
          headers: {
              "content-type": "application/json",
              connection: "keep-alive",
              "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
              bufferArray
          }),
      })
      .then((response) => {
          if (!response.ok) {
            console.error(response.statusText)
          }
          return response.json()
      })
      
      return attempt;
      } catch (e) {
          console.log(e)
      }
    return null;
  }
}