import { SourceType, ParsedTranscriptionType } from '../types/types';

enum HTTPMethod {
  Post = "POST",
}

const transcribeAudioEndpoint = 'https://q8mbkys2lb.execute-api.us-east-1.amazonaws.com/transcribeAudio';
const analyzeConversationEndpoint = 'https://041mbz10v3.execute-api.us-east-1.amazonaws.com/analyzeConversation';


export class openAIAPI {
  private analyzeConversationEndpoint: string;
  private transcribeAudioEndpoint: string;
  constructor() {
    this.analyzeConversationEndpoint = analyzeConversationEndpoint;
    this.transcribeAudioEndpoint = transcribeAudioEndpoint;
  }
  async transcribeAudioRequest(
    source: SourceType,
    timestamp: number,
    blob: Blob,
  ):Promise<ParsedTranscriptionType> {
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
              blob
          }),
      })
      .then((response) => {
          if (!response.ok) {
            console.error(response.statusText)
          }
          console.log(response);
          return response.json()
      })
      
      return attempt;
      } catch (e) {
          console.log(e)
      }
    return {source: SourceType.VOICE_ONE, timestamp: 0, text: ''};
  }

  async analyzeConversationRequest(
    bufferArray: ParsedTranscriptionType[],
  ):Promise<string> {
      try { 
      const attempt = fetch(this.analyzeConversationEndpoint, {
          method: HTTPMethod.Post,
          headers: {
              "content-type": "application/json",
              connection: "close",
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
    return "";
  }
}