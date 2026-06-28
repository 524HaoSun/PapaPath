/**
 * TypewriterText Component
 * Renders text with a typewriter animation effect.
 * Each character appears sequentially, simulating real-time AI generation.
 */
import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  /** Speed in ms per character (default: 30) */
  speed?: number;
  /** Delay before starting in ms (default: 0) */
  delay?: number;
  /** CSS class for the text */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Called when typing finishes */
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 30,
  delay = 0,
  className = "",
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTextRef = useRef(text);

  // Reset when text changes
  useEffect(() => {
    if (text !== prevTextRef.current) {
      setDisplayedLength(0);
      setStarted(false);
      prevTextRef.current = text;
    }
  }, [text]);

  // Delay before starting
  useEffect(() => {
    if (started) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay, started]);

  // Typing animation
  useEffect(() => {
    if (!started) return;
    if (displayedLength >= text.length) {
      onComplete?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, text.length, speed, onComplete, displayedLength]);

  const displayedText = text.slice(0, displayedLength);
  const isTyping = started && displayedLength < text.length;

  return (
    <span className={className} style={style}>
      {displayedText}
      {isTyping && (
        <span
          className="inline-block w-[2px] h-[1em] ml-[1px] align-text-bottom"
          style={{
            background: "oklch(0.52 0.09 188)",
            animation: "blink 0.8s step-end infinite",
          }}
        />
      )}
    </span>
  );
}
