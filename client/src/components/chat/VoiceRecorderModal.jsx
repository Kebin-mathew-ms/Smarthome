import React, { useState, useRef } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { Mic, Square, Play, Pause, Send, Trash2 } from 'lucide-react';
import AppModal from '../common/AppModal';

const { Text } = Typography;

const VoiceRecorderModal = ({ open, onCancel, onSendVoice }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      message.error('Microphone permission denied or unsupported browser mic.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      await onSendVoice(file);
      resetRecording();
      onCancel();
    } catch (err) {
      message.error('Failed to send voice note');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <AppModal
      title="Record Voice Note"
      open={open}
      onCancel={() => { resetRecording(); onCancel(); }}
      footer={null}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {!recording && !audioUrl && (
          <div>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<Mic size={24} />}
              onClick={startRecording}
              style={{ width: 64, height: 64, background: '#ef4444', borderColor: '#ef4444' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>Click microphone to start recording</Text>
          </div>
        )}

        {recording && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', marginBottom: 16 }}>
              ● {formatTime(recordingTime)}
            </div>
            <Button
              type="primary"
              danger
              icon={<Square size={20} />}
              onClick={stopRecording}
              size="large"
            >
              Stop Recording
            </Button>
          </div>
        )}

        {audioUrl && !recording && (
          <div>
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
            <div style={{ marginBottom: 16 }}>
              <Button
                shape="circle"
                size="large"
                icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
                onClick={togglePlayback}
              />
              <span style={{ marginLeft: 12, fontWeight: 600 }}>{formatTime(recordingTime)}</span>
            </div>

            <Space>
              <Button icon={<Trash2 size={16} />} danger onClick={resetRecording}>
                Discard
              </Button>
              <Button type="primary" icon={<Send size={16} />} loading={uploading} onClick={handleSend}>
                Send Voice Note
              </Button>
            </Space>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default VoiceRecorderModal;
