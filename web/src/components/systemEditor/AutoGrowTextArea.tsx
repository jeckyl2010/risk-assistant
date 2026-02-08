"use client";

import { useEffect, useRef } from "react";

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

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

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
