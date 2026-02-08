"use client";

import { useCallback, useEffect, useRef } from "react";

export function AutoGrowTextArea({
  value,
  onChange,
  placeholder,
  minRows,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minRows: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to resize when value changes externally
  useEffect(() => {
    resize();
  }, [resize, value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      rows={minRows}
      className={className}
    />
  );
}
