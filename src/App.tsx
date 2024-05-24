import React, { useState, useRef, useEffect } from 'react';
import srtParser2 from 'srt-parser-2';
import OpenAI from 'openai';
import { Button, Switch } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { motion } from 'framer-motion';
import { ParsedTranscriptionType, IssueType } from './types/types';
import {analyseConversation, transcribeAudio} from './lib/ai';
import { SourceType } from './types/types';
import { mockConversationData } from './mock/mock';
import sound from './audio/test.mp3';
import voiceone from './audio/voiceone.mp3';
import voicetwo from './audio/voicetwo.mp3';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micVoice, setMicVoice] = useState<boolean>(false);
  const [isVoiceOneAudioRecording, setIsVoiceOneAudioRecording] = useState<boolean>(false);
  const [isVoiceTwoAudioRecording, setIsVoiceTwoAudioRecording] = useState<boolean>(false);
  const [issues, setIssues] = useState<IssueType[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const parser = new srtParser2()
  
  const [bufferArray, setBufferArray] = useState<ParsedTranscriptionType[]>([{source: SourceType.VOICE_ONE, timestamp: 0, text: 'Hello, how are you?'}, {source: SourceType.MIC, timestamp: 0, text: 'I am good, how are you?'}]);

  const clearMicRecording = () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRecording(false);
  }

  const handleMicRecording = (newMicSource: SourceType, button: boolean) => {
    if (isRecording) {
      clearMicRecording();
      if (button)
        return;
    }
    // Start recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        let audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            audioChunks.push(e.data);
            const blob = new Blob(audioChunks, { type: 'audio/mp3' });
            const transcribed = await transcribeAudio(newMicSource, Date.now(), blob);
            console.log(transcribed);
            if (transcribed != null)
              setBufferArray((prev) => [...prev, transcribed]);
            audioChunks = []; // Clear the audio chunks after transcription
          }
        };

        mediaRecorder.onstop = () => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.requestData();
          }
        };

        mediaRecorder.start();

        intervalRef.current = window.setInterval(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            mediaRecorder.start();
          }
        }, 1000); // Stop and restart every 5 seconds, adjust as needed

      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });
    setIsRecording(true);
  };

  const handleMicChange = () => {
    const newMicSource = !micVoice;
    setMicVoice(newMicSource);
    handleMicRecording(newMicSource ? SourceType.VOICE_ONE : SourceType.VOICE_TWO, false);
  }

  const handleAudioRecording = (source: SourceType) => {
    if ((source === SourceType.VOICE_ONE && isVoiceOneAudioRecording) || (source === SourceType.VOICE_TWO && isVoiceTwoAudioRecording)) {
      // Stop recording
      if (audioMediaRecorderRef.current && audioMediaRecorderRef.current.state !== "inactive") {
        audioMediaRecorderRef.current.stop();
      }
      if (source === SourceType.VOICE_ONE)
        setIsVoiceOneAudioRecording(false);
      else
        setIsVoiceTwoAudioRecording(false);
    } else {
      // Start recording
      const audioContext = new (window.AudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      const audioSource = new Audio(source === SourceType.VOICE_ONE ? voiceone : voicetwo);
      audioSource.crossOrigin = 'anonymous'; // Allow cross-origin if necessary
      const sourceNode = audioContext.createMediaElementSource(audioSource);
      sourceNode.connect(destination);

      audioSource.play();

      const mediaRecorder = new MediaRecorder(destination.stream);
      audioMediaRecorderRef.current = mediaRecorder;
      let audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = async (e) => {

        if (e.data.size > 0) {
          audioChunks.push(e.data);
          const blob = new Blob(audioChunks, { type: 'audio/mp3' });
          const transcribed = await transcribeAudio(source, Date.now(), blob);
          if (transcribed != null)
            setBufferArray((prev) => [...prev, transcribed]);
          audioChunks = []; // Clear the audio chunks after transcription
        }
      };

      mediaRecorder.start();

      intervalRef.current = window.setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 5000); // Stop and restart every 5 seconds, adjust as needed
      if (source === SourceType.VOICE_ONE)
        setIsVoiceOneAudioRecording(true);
      else
        setIsVoiceTwoAudioRecording(true);
    }
  };
  const handleMouseOver = () => {
    setIsVoiceOneAudioRecording(false);
    setIsVoiceTwoAudioRecording(false);
  }
  useEffect(() => {
    bufferArray.sort((a, b) => a.timestamp - b.timestamp);
    if (bufferArray.length % 2 === 0){
      let output: any; 
      analyseConversation(bufferArray).then(response => {
        if (response != null){
          output = JSON.parse(response);
          setIssues((prev) => [...prev, output.issues].flat());
        }
      });
    }
  }, [bufferArray]);

  return (
    <div className="App" style={{height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 20, top:0, position: 'absolute', backgroundColor: '#282c34'}}>
        <div style={{ width: '100%', paddingLeft: '20px', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: 5, boxSizing: 'border-box'}}>
          {bufferArray.length > 0 && bufferArray.map((item, index) =>
            item.text.length > 0 && item.text != '.' && 
            
            <div style={{display: 'flex', justifyContent: item.source === SourceType.VOICE_ONE ? 'flex-start' : 'flex-end', opacity: Math.max(0, 1 - ((bufferArray.length - 1 - index) * 0.075))}} key={index}>
              { item.source === SourceType.VOICE_ONE && issues.find(issue => issue.voiceOneString === item.text) && 
                <ErrorIcon sx={{color: '#ab003c', position: 'relative', zIndex: 3}} onMouseOver={handleMouseOver}/>
              }
              <div style={{maxWidth: '40%', textAlign: item.source === SourceType.VOICE_ONE ? 'left' : 'right', left: item.source === SourceType.VOICE_ONE ? 0 : 100, color: item.source === SourceType.VOICE_ONE ? '#ed4b82' : '#2196f3', fontWeight: 700, borderRadius: 20, background: 'rgba(0,0,0,0.9)', padding: 10, boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 29px 0px'}}>
                { item.text.split('').map((char, index) =>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: index / 100,
                      }}
                      key={index}
                    >
                      {char}
                    </motion.span>
                  )
                }
              </div>
              { item.source === SourceType.VOICE_TWO && issues.find(issue => issue.voiceTwoString === item.text) && 
                <ErrorIcon sx={{color: '#ab003c', zIndex: 3}} onMouseOver={handleMouseOver}/>
              }
            </div>
          )}
        </div>
        <div style={{display: 'flex', width: '100%', justifyContent: 'center', gap: 10, paddingBottom: 20}}>
          <div>
            <Button onClick={() => handleMicRecording(SourceType.VOICE_TWO, true)} variant="contained" style={{backgroundColor: "rgba(0,0,0,0.6)"}}>
              {isRecording ? 'Stop Mic Recording' : 'Start Mic Recording'}
            </Button>
            <Switch defaultChecked onChange={handleMicChange}/>
          </div>
          <div>
            <Button onClick={() => handleAudioRecording(SourceType.VOICE_ONE)} variant="contained" style={{backgroundColor: "rgba(0,0,0,0.6)"}}>
              {isVoiceOneAudioRecording ? 'Stop Voice 1' : 'Start Voice 1'}
            </Button>
          </div>
          <div>
            <Button onClick={() => handleAudioRecording(SourceType.VOICE_TWO)} variant="contained" style={{backgroundColor: "rgba(0,0,0,0.6)"}}>
              {isVoiceTwoAudioRecording ? 'Stop Voice 2' : 'Start Voice 2'}
            </Button>
          </div>
        </div>
    </div>
  );
}

export default App;
