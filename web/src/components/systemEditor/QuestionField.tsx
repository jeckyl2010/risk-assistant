"use client";

import { formatIdentifier } from "@/lib/formatting";
import type { Question } from "@/lib/uiTypes";
import { AutoGrowTextArea } from "./AutoGrowTextArea";
import type { SectionAccent } from "./sectionAccent";
import { sectionAccent } from "./sectionAccent";
import styles from "./systemEditorStyles.module.css";

export function QuestionField({
  q,
  value,
  reason,
  onChange,
  onReasonChange,
  accent,
}: {
  q: Question;
  value: unknown;
  reason: unknown;
  onChange: (next: unknown) => void;
  onReasonChange: (next: string) => void;
  accent?: SectionAccent;
}) {
  const isUnset = value === null;
  const a = accent ?? sectionAccent("base");

  return (
    <div className={`${styles.questionCard} ${a.cardTop} ${a.cardBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={styles.questionTitle}>{q.text}</div>
          {q.description ? <div className={styles.questionDesc}>{q.description}</div> : null}
        </div>
      </div>

      <div
        className={
          styles.answerPanel +
          " " +
          (isUnset
            ? "border-dashed border-amber-200/80 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/15"
            : "border-sky-200/80 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/15")
        }
      >
        <div className={styles.answerRow}>
          <div
            className={
              styles.answerChip +
              " " +
              (isUnset
                ? "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
                : "border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-100")
            }
          >
            <span
              className={`${styles.answerDot} ${isUnset ? "bg-amber-500 dark:bg-amber-300" : "bg-sky-600 dark:bg-sky-300"}`}
            />
            Answer
          </div>
          {isUnset ? (
            <div className="text-xs text-amber-800 dark:text-amber-200">Not answered yet</div>
          ) : (
            <div className="text-xs text-sky-800 dark:text-sky-200">Answered</div>
          )}
        </div>

        <div className="mt-2">
          {q.type === "bool" ? (
            <select
              value={value === true ? "true" : value === false ? "false" : ""}
              onChange={(e) => {
                const v = e.target.value;
                onChange(v === "" ? null : v === "true");
              }}
              className={
                styles.answerInput +
                " [color-scheme:light] dark:[color-scheme:dark] focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
              }
            >
              <option value="">(unset)</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : null}

          {q.type === "enum" ? (
            <div className="flex flex-col gap-2">
              <select
                value={typeof value === "string" ? value : ""}
                onChange={(e) => onChange(e.target.value || null)}
                className={
                  styles.answerInput +
                  " [color-scheme:light] dark:[color-scheme:dark] focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
                }
              >
                <option value="">(unset)</option>
                {(q.allowed ?? []).map((a) => (
                  <option key={a} value={a}>
                    {formatIdentifier(a)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {q.type === "set" ? (
            <div className="flex flex-col gap-2">
              <div className={styles.setContainer}>
                {(q.allowed ?? []).map((a) => {
                  const arr = Array.isArray(value) ? value : [];
                  const checked = arr.includes(a);
                  return (
                    <label key={a} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(arr);
                          if (e.target.checked) next.add(a);
                          else next.delete(a);
                          onChange(Array.from(next).sort());
                        }}
                        className="h-4 w-4 accent-zinc-900 dark:accent-zinc-50"
                      />
                      {formatIdentifier(a)}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: AutoGrowTextArea renders a textarea element */}
        <label className={styles.reasonLabel}>
          Reason (optional)
          <AutoGrowTextArea
            value={typeof reason === "string" ? reason : ""}
            onChange={onReasonChange}
            placeholder="Why did you choose this answer? Link to docs, context, constraints, …"
            minRows={2}
            className={
              styles.reasonTextArea +
              " [color-scheme:light] dark:[color-scheme:dark] focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
            }
          />
        </label>
      </div>
    </div>
  );
}
