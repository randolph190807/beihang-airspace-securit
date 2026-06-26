import { useEffect, useState } from "react";
import { fetchJudgmentTemplate } from "@/features/judgment/api";
import type { JudgmentSegment, JudgmentTemplate } from "@/features/judgment/types";

const cache = new Map<JudgmentSegment, JudgmentTemplate>();

export function useJudgmentTemplate(segment: JudgmentSegment | null) {
  const [template, setTemplate] = useState<JudgmentTemplate | null>(
    segment ? (cache.get(segment) ?? null) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!segment) {
      setTemplate(null);
      return;
    }

    const cached = cache.get(segment);
    if (cached) {
      setTemplate(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchJudgmentTemplate(segment)
      .then((data) => {
        if (cancelled) return;
        cache.set(segment, data);
        setTemplate(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载研判模板失败");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [segment]);

  return { template, loading, error };
}

export function useAiStream(fullText: string, delayMs: number, resetKey: string) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setText("");
    setDone(false);
    if (!fullText) return;

    const chars = [...fullText];
    const step = Math.max(1, Math.ceil(chars.length / (delayMs / 30)));
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(chars.length, index + step);
      setText(chars.slice(0, index).join(""));
      if (index >= chars.length) {
        setDone(true);
        window.clearInterval(timer);
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [fullText, delayMs, resetKey]);

  return { text, done };
}
