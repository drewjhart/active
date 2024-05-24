export enum SourceType {
  MIC = 'mic',
  VOICE_ONE = 'voiceone',
  VOICE_TWO = 'voicetwo',
}

export type ParsedTranscriptionType = {
  source: SourceType;
  timestamp: number;
  text: string;
};

export type IssueType = {
  voiceOneString: string;
  voiceTwoString: string;
  reason: string;
};