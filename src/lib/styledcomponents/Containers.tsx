import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { ParsedTranscriptionType, SourceType } from '../../types/types';

export const MainContainer = styled(Box)(() => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: 20,
  top: 0,
  position: 'absolute',
  backgroundColor: '#282c34',
}));

export const ChatContainer = styled(Box)(() => ({
  width: '100%',
  paddingLeft: '20px',
  paddingRight: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  boxSizing: 'border-box',
}));

export const ButtonContainer = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  gap: 10,
  paddingBottom: 20,
}));

// container that adjusts opacity based on distance from current item
// fades out items as they near the top of the screen
interface FadeOutContainerProps {
  item: ParsedTranscriptionType;
  bufferArray: ParsedTranscriptionType[];
  index: number;
}

export const FadeOutContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'item' && prop !== 'bufferArray' && prop !== 'index',
})<FadeOutContainerProps>(({ item, bufferArray, index }) => ({
  display: 'flex',
  justifyContent:
    item.source === SourceType.VOICE_ONE ? 'flex-start' : 'flex-end',
  opacity: Math.max(0, 1 - (bufferArray.length - 1 - index) * 0.075),
}));

interface AnimatedTextContainerProps {
  item: ParsedTranscriptionType;
}

export const AnimatedTextContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'item',
})<AnimatedTextContainerProps>(({ item }) => ({
  maxWidth: '40%',
  textAlign: item.source === SourceType.VOICE_ONE ? 'left' : 'right',
  left: item.source === SourceType.VOICE_ONE ? 0 : 100,
  color: item.source === SourceType.VOICE_ONE ? '#ed4b82' : '#2196f3',
  fontWeight: 700,
  borderRadius: 20,
  background: 'rgba(0,0,0,0.9)',
  padding: 10,
  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 29px 0px',
}));
