/**
 * Voice Recorder Component
 * Ghi âm giọng hát người dùng (local only, không upload Firebase)
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic2, Square, Play, Download, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { showToast } from "@/components/Toast";

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      showToast("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic2 className="w-6 h-6" />
        Ghi âm giọng hát
      </h3>

      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center gap-4">
          {!isRecording && !audioUrl && (
            <button
              onClick={startRecording}
              className="btn-primary flex items-center gap-2"
            >
              <Mic2 className="w-5 h-5" />
              Bắt đầu ghi âm
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={stopRecording}
                className="btn-secondary flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Dừng ghi âm
              </button>
              <div className="text-lg font-semibold text-military-red">
                {formatTime(recordingTime)}
              </div>
            </>
          )}
        </div>

        {/* Playback Controls */}
        {audioUrl && (
          <div className="space-y-2">
            <audio ref={audioRef} src={audioUrl} />
            <div className="flex items-center gap-2">
              <button
                onClick={playRecording}
                disabled={isPlaying}
                className={cn(
                  "btn-primary flex items-center gap-2",
                  isPlaying && "opacity-50 cursor-not-allowed"
                )}
              >
                <Play className="w-5 h-5" />
                Phát lại
              </button>
              <button
                onClick={downloadRecording}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Tải xuống
              </button>
              <button
                onClick={clearRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Xóa
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              File sẽ được lưu dưới dạng .webm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}





