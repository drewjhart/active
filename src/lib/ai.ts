import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';
import {Buffer} from 'buffer';
import OpenAI, { toFile } from 'openai';
import { SourceType, ParsedTranscriptionType, ParsedIssueType } from '../types/types';

enum HTTPMethod {
  Post = "POST",
}

const transcribeAudioEndpoint = 'https://q8mbkys2lb.execute-api.us-east-1.amazonaws.com/transcribeAudio/transcribeAudio-main';
const analyzeConversationEndpoint = 'https://041mbz10v3.execute-api.us-east-1.amazonaws.com/analyzeConversation/analyzeConversation-main';

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