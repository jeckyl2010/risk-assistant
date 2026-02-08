import type { Metadata } from "next";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation - Risk Assistant",
  description: "Understanding Risk Assistant: concepts, workflow, and terminology",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
              <Home className="h-4 w-4" />
              Portfolio
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium">Documentation</span>
          </nav>
          <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
            Documentation
          </h1>
          <p className="mt-3 text-xl text-slate-600">
            Understanding how Risk Assistant helps you build safer, more reliable systems
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-16">
          {/* What is Risk Assistant */}
          <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">What is Risk Assistant?</h2>
            <div className="space-y-4 text-lg leading-relaxed text-slate-700">
              <p>
                Risk Assistant is a <strong>risk-informed architecture guardrail tool</strong> for manufacturing and enterprise
                IT systems. It helps you identify and address risks early in the development lifecycle by asking the right
                questions and deriving appropriate controls.
              </p>
              <div className="my-6 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-6">
                <p className="text-lg font-semibold text-indigo-900">Guardrail, not a gate</p>
                <p className="mt-2 text-base text-indigo-800">
                  Risk Assistant surfaces risks and controls to consider—it doesn't block your progress. The goal is informed
                  decision-making, not bureaucratic gatekeeping.
                </p>
              </div>
              <p>
                Unlike traditional risk scoring tools that produce probabilistic metrics (risk scores, heat maps,
                red/amber/green ratings), Risk Assistant takes a <strong>deterministic, facts-based approach</strong>. It
                derives specific controls based on your system's characteristics, not subjective assessments.
              </p>
            </div>
          </section>

          {/* Core Philosophy */}
          <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Core Philosophy</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <svg
                      className="h-6 w-6 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Deterministic</h3>
                </div>
                <p className="text-slate-600">
                  Controls are derived from objective facts about your system. Same inputs always produce the same outputs—no
                  subjective scoring.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Facts-Based</h3>
                </div>
                <p className="text-slate-600">
                  Every control is triggered by specific, verifiable facts about your system architecture and deployment
                  context.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                    <svg
                      className="h-6 w-6 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Question-Driven</h3>
                </div>
                <p className="text-slate-600">
                  Domain experts encode their knowledge as questions. Answering these questions about your system triggers
                  relevant controls.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <svg
                      className="h-6 w-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Evidence-Focused</h3>
                </div>
                <p className="text-slate-600">
                  Controls require verification through documentation, configuration, logs, or pipeline evidence—not promises.
                </p>
              </div>
            </div>
          </section>

          {/* Core Concepts */}
          <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Core Concepts</h2>
            <div className="space-y-8">
              {/* Domains */}
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-slate-900">Domains</h3>
                <p className="mb-4 text-lg text-slate-700">
                  Risk Assistant organizes knowledge into domain categories, each covering a specific aspect of system design
                  and operations:
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border-l-4 border-violet-500 bg-violet-50 px-4 py-3">
                    <span className="font-semibold text-violet-900">AI</span>
                    <p className="text-sm text-violet-700">Emerging technologies</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
                    <span className="font-semibold text-rose-900">Security</span>
                    <p className="text-sm text-rose-700">Authentication, encryption, trust</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 px-4 py-3">
                    <span className="font-semibold text-cyan-900">Data</span>
                    <p className="text-sm text-cyan-700">Privacy, compliance, handling</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 px-4 py-3">
                    <span className="font-semibold text-teal-900">Operations</span>
                    <p className="text-sm text-teal-700">Observability, DR, scale</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 px-4 py-3">
                    <span className="font-semibold text-sky-900">Integration</span>
                    <p className="text-sm text-sky-700">APIs, commands, data flow</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-lime-500 bg-lime-50 px-4 py-3">
                    <span className="font-semibold text-lime-900">Cost</span>
                    <p className="text-sm text-lime-700">Budget, commitment, guardrails</p>
                  </div>
                  <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3">
                    <span className="font-semibold text-amber-900">Criticality</span>
                    <p className="text-sm text-amber-700">Production impact, isolation</p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-slate-900">Questions</h3>
                <p className="mb-4 text-lg text-slate-700">
                  Questions are the fundamental building blocks. Each question captures a specific fact about your system:
                </p>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        Q
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Does this system handle personal data?</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Answer: Yes/No → triggers GDPR controls, encryption requirements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        Q
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">What is the manufacturing criticality level?</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Answer: C0/C1/C2/C3/C4 → triggers isolation, failover, resilience controls
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        Q
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Does this system use AI/ML?</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Answer: Yes → triggers governance, validation, human oversight controls
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-base text-slate-600">
                  Questions can have different answer types: boolean (yes/no), choice (select one), or multi-choice (select
                  many). Some questions are conditional—they only appear based on previous answers.
                </p>
              </div>

              {/* Controls */}
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-slate-900">Controls</h3>
                <p className="mb-4 text-lg text-slate-700">
                  Controls are specific actions, configurations, or procedures you should implement. Each control has:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                      ID
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Unique identifier</p>
                      <p className="text-sm text-slate-600">
                        Example: <code className="rounded bg-slate-100 px-1.5 py-0.5">SEC-TLS-001</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                      📋
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Title and description</p>
                      <p className="text-sm text-slate-600">Clear explanation of what to implement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                      ⚙️
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Scope and enforcement</p>
                      <p className="text-sm text-slate-600">
                        System-level or deployment-level; automatic (config/pipeline) or procedural (process/review)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                      📎
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Evidence requirements</p>
                      <p className="text-sm text-slate-600">
                        What you need to provide: documentation, configuration files, logs, pipeline artifacts, or work items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                      🔗
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">References</p>
                      <p className="text-sm text-slate-600">
                        Links to documentation, work items, requirements, or configuration examples
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Triggers */}
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-slate-900">Triggers</h3>
                <p className="mb-4 text-lg text-slate-700">
                  Trigger rules define the conditions under which controls are derived. They express business logic in a
                  declarative way:
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <p className="text-slate-700">
                      <span className="text-blue-600">when:</span> uses_ai = true
                    </p>
                    <p className="text-slate-700">
                      <span className="text-blue-600">then:</span> derive AI-GOV-001
                    </p>
                    <p className="mt-4 text-slate-700">
                      <span className="text-blue-600">when:</span> data.personal_data = true
                    </p>
                    <p className="text-slate-700">
                      <span className="text-blue-600">and:</span> security.crosses_trust_boundary = true
                    </p>
                    <p className="text-slate-700">
                      <span className="text-blue-600">then:</span> derive DATA-ENC-001, SEC-NET-001
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-base text-slate-600">
                  Multiple conditions can be combined with AND/OR logic. When all conditions match, the specified controls are
                  automatically derived.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Define Your System</h3>
                  <p className="text-slate-700">
                    Create a system definition with basic metadata (name, description, team, repository). This is your starting
                    point.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Answer Questions</h3>
                  <p className="text-slate-700">
                    Work through domain-specific questions about your system. Questions adapt based on your answers—you only see
                    what's relevant. As you answer, domains are activated and the question set expands.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Review Derived Controls</h3>
                  <p className="text-slate-700">
                    Based on your answers, Risk Assistant automatically derives applicable controls. Each control shows{" "}
                    <em>why</em> it was triggered (which questions/conditions activated it).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Provide Evidence</h3>
                  <p className="text-slate-700">
                    Add references (documentation links, work items, requirements, configuration files) that demonstrate you've
                    implemented each control. This creates an audit trail.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Iterate and Update</h3>
                  <p className="text-slate-700">
                    As your system evolves, update your answers. Controls automatically adjust—new risks surface, resolved risks
                    disappear. The system stays current with your architecture.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Terms */}
          <section>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">Key Terms</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Facts</h3>
                <p className="text-sm text-slate-600">
                  The complete set of answers to all questions about your system. Also called "system definition" or "system
                  facts."
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Model</h3>
                <p className="text-sm text-slate-600">
                  The knowledge base: question catalog, control catalog, and trigger rules. Maintained separately from system
                  definitions.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Evaluation</h3>
                <p className="text-sm text-slate-600">
                  The process of applying trigger rules to your system facts to derive the set of applicable controls.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Portfolio</h3>
                <p className="text-sm text-slate-600">
                  The collection of all systems being tracked. Portfolio view shows status across all systems at a glance.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Domain Activation</h3>
                <p className="text-sm text-slate-600">
                  Domains become "activated" when base questions indicate they're relevant. Activated domains expose additional
                  questions.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Evidence</h3>
                <p className="text-sm text-slate-600">
                  Verification that controls have been implemented: documents, configs, logs, pipelines, or work items proving
                  compliance.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Scope</h3>
                <p className="text-sm text-slate-600">
                  Whether a control applies at system level (design/architecture) or deployment level (per
                  environment/instance).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-slate-900">Enforcement</h3>
                <p className="text-sm text-slate-600">
                  How a control is applied: automatic (technical config/pipeline) or procedural (process/manual review).
                </p>
              </div>
            </div>
          </section>

          {/* When to Use */}
          <section className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">When to Use Risk Assistant</h2>
            <div className="space-y-4 text-lg text-slate-700">
              <p>Risk Assistant is designed for:</p>
              <ul className="ml-6 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-indigo-600">✓</span>
                  <span>
                    <strong>Manufacturing and enterprise IT systems</strong> where safety, reliability, and compliance matter
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-indigo-600">✓</span>
                  <span>
                    <strong>Early-stage architecture decisions</strong> when you want to identify risks before building
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-indigo-600">✓</span>
                  <span>
                    <strong>System evolution and updates</strong> to understand how changes affect risk profile
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-indigo-600">✓</span>
                  <span>
                    <strong>Documentation and compliance</strong> to create an audit trail of risk considerations
                  </span>
                </li>
              </ul>
              <p className="pt-4">
                It's <em>not</em> a replacement for threat modeling, penetration testing, or formal security audits. It's a
                complementary tool that helps you ask the right questions and track the right controls.
              </p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Back to Portfolio
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
