"use client";

import { BarChart3, FileText, GitCompare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDiffSystem, useEvaluateSystem, useSaveSystem } from "@/hooks/useSystemApi";
import { SECTION_IDS } from "@/lib/constants";
import type { Question, TriggerRule } from "@/lib/uiTypes";
import { DescriptionSection } from "../system/DescriptionSection";
import { DiffSection } from "../system/DiffSection";
import { ErrorAlert } from "../system/ErrorAlert";
import { QuestionsList } from "../system/QuestionsList";
import { ResultsSection } from "../system/ResultsSection";
import { SystemHeader } from "../system/SystemHeader";
import { SystemSidebar } from "../system/SystemSidebar";
import { CommandPalette } from "../ui/command-palette";
import { deepDelete, deepGet, deepSet, type Facts } from "./facts";
import { domainTitle } from "./sectionAccent";

function matchesCondition(facts: Facts, cond: Record<string, unknown>): boolean {
  for (const [k, expected] of Object.entries(cond)) {
    const actual = k.includes(".") ? deepGet(facts, k) : deepGet(facts, `base.${k}`);
    if (Array.isArray(actual) && !Array.isArray(expected)) {
      if (!actual.includes(expected)) return false;
    } else {
      if (actual !== expected) return false;
    }
  }
  return true;
}

function deriveActivatedDomainsFromTriggers(facts: Facts, triggers: TriggerRule[]): string[] {
  const activated = new Set<string>();
  for (const t of triggers ?? []) {
    const cond = t.when ?? {};
    if (matchesCondition(facts, cond)) {
      for (const d of t.activate ?? []) activated.add(d);
    }
  }
  return Array.from(activated).sort();
}

export function SystemEditor({
  id,
  initialFacts,
  model,
  baseQuestions,
  baseDescription,
  domainQuestions,
  domainDescriptions,
  triggers,
}: {
  id: string;
  initialFacts: Facts;
  model: { modelDir: string; modelVersion: string };
  baseQuestions: Question[];
  baseDescription?: string;
  domainQuestions: Record<string, Question[]>;
  domainDescriptions: Record<string, string>;
  triggers: TriggerRule[];
}) {
  // Local state
  const [facts, setFacts] = useState<Facts>(() => ({ scope: "system", base: {}, ...initialFacts }));
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS.DESCRIPTION);

  // API hooks
  const { save, state: saveState, error: saveError } = useSaveSystem(id);
  const { evaluate, result: evaluateResult, state: evalState, error: evalError } = useEvaluateSystem();
  const { diff: runDiff, result: diffResult, state: diffState, error: diffError } = useDiffSystem();

  // Combined error state
  const error = saveError || evalError || diffError;

  // Map generic async states to component-specific states
  const mappedSaveState: "idle" | "saving" | "saved" | "error" =
    saveState === "loading" ? "saving" : saveState === "success" ? "saved" : (saveState as "idle" | "error");

  const mappedEvalState: "idle" | "running" | "error" =
    evalState === "loading" ? "running" : evalState === "success" ? "idle" : (evalState as "idle" | "error");

  // Derive activated domains from triggers
  const activatedDomains = useMemo(() => deriveActivatedDomainsFromTriggers(facts, triggers), [facts, triggers]);

  // Callbacks for API operations
  const handleSave = useCallback(() => {
    save(facts);
  }, [save, facts]);

  const handleEvaluate = useCallback(async () => {
    const result = await evaluate(facts, model.modelDir);
    if (result) {
      setActiveSection(SECTION_IDS.RESULTS);
    }
  }, [evaluate, facts, model.modelDir]);

  const handleDiff = useCallback(
    async (oldModelDir: string, newModelDir: string) => {
      await runDiff(facts, oldModelDir, newModelDir);
    },
    [runDiff, facts],
  );

  // Question sections derived from activated domains
  const questionSections: Array<{
    key: string;
    title: string;
    description?: string;
    questions: Question[];
    prefix: string;
  }> = useMemo(() => {
    return [
      {
        key: SECTION_IDS.BASE,
        title: domainTitle(SECTION_IDS.BASE),
        description: baseDescription,
        questions: baseQuestions,
        prefix: SECTION_IDS.BASE,
      },
      ...activatedDomains.map((d) => ({
        key: d,
        title: domainTitle(d),
        description: domainDescriptions[d],
        questions: domainQuestions[d] ?? [],
        prefix: d,
      })),
    ];
  }, [activatedDomains, baseQuestions, baseDescription, domainQuestions, domainDescriptions]);

  const questionProgress = useMemo(() => {
    const out: Record<string, { answered: number; total: number }> = {};
    for (const s of questionSections) {
      let answered = 0;
      for (const q of s.questions) {
        const v = deepGet(facts, `${s.prefix}.${q.id}`);
        if (v !== null) answered++;
      }
      out[s.key] = { answered, total: s.questions.length };
    }
    return out;
  }, [facts, questionSections]);

  const questionMetaByFullId = useMemo(() => {
    const m = new Map<string, { sectionKey: string; sectionTitle: string; text: string }>();
    for (const s of questionSections) {
      for (const q of s.questions) {
        m.set(`${s.prefix}.${q.id}`, { sectionKey: s.key, sectionTitle: s.title, text: q.text });
      }
    }
    return m;
  }, [questionSections]);

  const sidebarItems = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      icon?: React.ReactNode;
      badge?: string | number;
      variant?: "default" | "success" | "warning";
    }> = [
      {
        id: SECTION_IDS.DESCRIPTION,
        label: "Overview",
        icon: <FileText className="h-4 w-4" />,
      },
    ];

    questionSections.forEach((s) => {
      const progress = questionProgress[s.key];
      items.push({
        id: s.key,
        label: s.title,
        badge: progress ? `${progress.answered}/${progress.total}` : undefined,
        variant:
          progress && progress.answered === progress.total
            ? ("success" as const)
            : progress && progress.answered > 0
              ? ("warning" as const)
              : ("default" as const),
      });
    });

    items.push(
      {
        id: SECTION_IDS.RESULTS,
        label: "Results",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: evaluateResult ? evaluateResult.result.derived_controls.length : undefined,
      },
      {
        id: SECTION_IDS.DIFF,
        label: "Diff",
        icon: <GitCompare className="h-4 w-4" />,
      },
    );

    return items;
  }, [questionSections, questionProgress, evaluateResult]);

  // Ensure active section is still valid when domains change
  useEffect(() => {
    // Special sections that don't depend on domain questions
    if (
      activeSection === SECTION_IDS.DESCRIPTION ||
      activeSection === SECTION_IDS.BASE ||
      activeSection === SECTION_IDS.RESULTS ||
      activeSection === SECTION_IDS.DIFF
    ) {
      return;
    }

    // Check if activeSection is still a valid domain
    const stillValid = questionSections.some((s) => s.key === activeSection);
    if (!stillValid) setActiveSection(SECTION_IDS.BASE);
  }, [activeSection, questionSections]);

  // Question value accessors with useCallback
  const getValue = useCallback(
    (sectionKey: string, questionId: string) => {
      const section = questionSections.find((s) => s.key === sectionKey);
      if (!section) return null;
      return deepGet(facts, `${section.prefix}.${questionId}`);
    },
    [facts, questionSections],
  );

  const getReason = useCallback(
    (sectionKey: string, questionId: string) => {
      const section = questionSections.find((s) => s.key === sectionKey);
      if (!section) return null;
      return deepGet(facts, `${section.prefix}._reasons.${questionId}`);
    },
    [facts, questionSections],
  );

  const handleQuestionChange = useCallback(
    (sectionKey: string, questionId: string, value: unknown) => {
      const section = questionSections.find((s) => s.key === sectionKey);
      if (!section) return;
      const path = `${section.prefix}.${questionId}`;
      setFacts((prev) => deepSet(prev, path, value));
    },
    [questionSections],
  );

  const handleReasonChange = useCallback(
    (sectionKey: string, questionId: string, value: string) => {
      const section = questionSections.find((s) => s.key === sectionKey);
      if (!section) return;
      const path = `${section.prefix}._reasons.${questionId}`;
      const trimmed = value.trim();
      setFacts((prev) => (trimmed ? deepSet(prev, path, value) : deepDelete(prev, path)));
    },
    [questionSections],
  );

  const handleDescriptionChange = useCallback((value: string) => {
    setFacts((prev) => deepSet(prev, "description", value));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      <CommandPalette
        systemId={id}
        onSave={handleSave}
        onEvaluate={handleEvaluate}
        onNavigate={setActiveSection}
        questionSections={questionSections}
      />;

      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Evaluate: Cmd/Ctrl + E
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleEvaluate();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleSave, handleEvaluate, id, questionSections]);

  const currentSection = questionSections.find((s) => s.key === activeSection);

  return (
    <div className="flex flex-col gap-6">
      <SystemHeader
        id={id}
        modelVersion={model.modelVersion}
        activatedDomains={activatedDomains}
        onSave={handleSave}
        onEvaluate={handleEvaluate}
        saveState={mappedSaveState}
        evalState={mappedEvalState}
        derivedControls={evaluateResult?.result.derived_controls.length}
        missingAnswers={evaluateResult?.result.required_questions.filter((q) => !q.answered).length}
      />

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SystemSidebar items={sidebarItems} activeId={activeSection} onNavigate={setActiveSection} />
        </aside>

        <main>
          {activeSection === SECTION_IDS.DESCRIPTION && (
            <DescriptionSection
              description={typeof facts.description === "string" ? facts.description : ""}
              onChange={handleDescriptionChange}
            />
          )}

          {currentSection && (
            <QuestionsList
              title={currentSection.title}
              description={currentSection.description}
              questions={currentSection.questions}
              prefix={currentSection.prefix}
              domain={currentSection.key}
              getValue={(qid) => getValue(currentSection.key, qid)}
              getReason={(qid) => getReason(currentSection.key, qid)}
              onChange={(qid, value) => handleQuestionChange(currentSection.key, qid, value)}
              onReasonChange={(qid, value) => handleReasonChange(currentSection.key, qid, value)}
            />
          )}

          {activeSection === SECTION_IDS.RESULTS && evaluateResult && (
            <ResultsSection
              derivedControls={evaluateResult.result.derived_controls}
              requiredQuestions={evaluateResult.result.required_questions}
              questionMetaByFullId={questionMetaByFullId}
              onNavigateToSection={setActiveSection}
            />
          )}

          {activeSection === SECTION_IDS.DIFF && (
            <DiffSection onRunDiff={handleDiff} diffResult={diffResult} isRunning={diffState === "loading"} />
          )}
        </main>
      </div>
    </div>
  );
}
