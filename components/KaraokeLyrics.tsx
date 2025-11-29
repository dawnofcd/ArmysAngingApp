/**
 * Karaoke Lyrics Component
 * Hiển thị lyrics với highlight theo dòng đang hát
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Music } from "lucide-react";

interface KaraokeLyricsProps {
  lyrics: string;
  videoId?: string; // YouTube video ID để sync (optional)
}

export function KaraokeLyrics({ lyrics, videoId }: KaraokeLyricsProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current line
  useEffect(() => {
    if (containerRef.current) {
      const activeLine = containerRef.current.children[currentLine] as HTMLElement;
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentLine]);

  // Manual line selection
  const handleLineClick = (index: number) => {
    setCurrentLine(index);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Music className="w-6 h-6" />
        Lời bài hát
      </h3>

      <div
        ref={containerRef}
        className="aspect-video overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
      >
        {lines.map((line, index) => (
          <div
            key={index}
            onClick={() => handleLineClick(index)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all duration-300
              ${
                index === currentLine
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold scale-105 shadow-md"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            {line.trim() || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}


