#!/usr/bin/env bun
/**
 * Risk Assistant CLI
 *
 * Usage:
 *   bun tools/riskctl.ts evaluate <facts.yaml> [--model-dir model]
 *   bun tools/riskctl.ts diff <facts.yaml> --old model-v1 --new model-v2
 */

import { parseArgs } from "node:util";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateFacts } from "../web/src/lib/evaluator";
import { modelPaths, getModelVersion } from "../web/src/lib/model";
import { loadYamlFile } from "../web/src/lib/yaml";
import type { Facts, EvaluateResult } from "../web/src/lib/evaluator";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";

function findRepoRoot(startPath: string): string {
	let current = startPath;
	while (current !== "/") {
		if (existsSync(resolve(current, "model"))) {
			return current;
		}
		const parent = resolve(current, "..");
		if (parent === current) break;
		current = parent;
	}
	return startPath;
}

async function evaluate(factsPath: string, modelDir: string) {
	const repoRoot = findRepoRoot(process.cwd());
	const absoluteFactsPath = resolve(repoRoot, factsPath);

	if (!existsSync(absoluteFactsPath)) {
		console.error(`${RED}Error:${RESET} Facts file not found: ${factsPath}`);
		process.exit(2);
	}

	console.log(`${BOLD}Evaluating${RESET} ${CYAN}${factsPath}${RESET} with model ${CYAN}${modelDir}${RESET}...\n`);

	const facts = await loadYamlFile<Facts>(absoluteFactsPath);
	const paths = modelPaths(repoRoot, modelDir);
	const version = await getModelVersion(repoRoot, modelDir);

	console.log(`${BOLD}Model version:${RESET} ${version}\n`);

	// Check for version mismatch
	const pinnedVersion = facts.model_version;
	if (typeof pinnedVersion === "string" && pinnedVersion.trim() && pinnedVersion.trim() !== version) {
		console.error(
			`${YELLOW}WARN:${RESET} facts model_version '${pinnedVersion.trim()}' does not match loaded model '${version}'\n`,
		);
	}

	const result = await evaluateFacts(facts, paths);

	printActivatedDomains(result.activated_domains, paths.questionsDir);
	printRequiredQuestions(result.required_questions);
	printDerivedControls(result.derived_controls);
}

function printActivatedDomains(domains: string[], questionsDir: string) {
	console.log(`${BOLD}Activated domains:${RESET}`);
	if (domains.length === 0) {
		console.log(`${DIM}  - (none)${RESET}`);
	} else {
		for (const domain of domains) {
			const filePath = `${questionsDir}/${domain}.questions.yaml`;
			console.log(`  ${GREEN}•${RESET} ${domain} ${DIM}(${filePath})${RESET}`);
		}
	}
	console.log();
}

function printRequiredQuestions(questions: Array<{ id: string; answered: boolean }>) {
	const missing = questions.filter((q) => !q.answered);
	const answered = questions.length - missing.length;

	console.log(`${BOLD}Required questions:${RESET}`);
	console.log(`  Total: ${questions.length}`);
	console.log(`  ${GREEN}Answered: ${answered}${RESET}`);
	console.log(`  ${missing.length > 0 ? YELLOW : GREEN}Missing: ${missing.length}${RESET}`);

	if (missing.length > 0) {
		console.log(`\n  ${BOLD}Missing answers:${RESET}`);
		// Group by domain
		const byDomain = new Map<string, string[]>();
		for (const q of missing) {
			const [domain, ...rest] = q.id.split(".");
			const qid = rest.join(".");
			if (!byDomain.has(domain)) byDomain.set(domain, []);
			byDomain.get(domain)!.push(qid);
		}

		for (const [domain, ids] of Array.from(byDomain.entries()).sort()) {
			console.log(`    ${BOLD}${domain}:${RESET}`);
			for (const id of ids) {
				console.log(`      ${YELLOW}○${RESET} ${id}`);
			}
		}
	}
	console.log();
}

function printDerivedControls(
	controls: Array<{
		id: string;
		title: string;
		scope: string;
		enforcement_intent: string;
		activation_phase: string;
		evidence_type: string[];
		because: Record<string, unknown>[];
		references?: Array<{ type: string; ref: string; description?: string }>;
	}>,
) {
	console.log(`${BOLD}Derived controls:${RESET}`);
	if (controls.length === 0) {
		console.log(`${DIM}  - (none)${RESET}\n`);
		return;
	}

	console.log(`  ${BOLD}Total: ${controls.length}${RESET}\n`);

	for (const c of controls) {
		console.log(`  ${CYAN}${BOLD}${c.id}${RESET}: ${c.title}`);
		console.log(`    ${DIM}scope:${RESET} ${c.scope}`);
		console.log(`    ${DIM}enforcement:${RESET} ${c.enforcement_intent}`);
		console.log(`    ${DIM}phase:${RESET} ${c.activation_phase}`);

		if (c.evidence_type.length > 0) {
			console.log(`    ${DIM}evidence:${RESET} ${c.evidence_type.join(", ")}`);
		}

		if (c.references && c.references.length > 0) {
			console.log(`    ${DIM}references:${RESET}`);
			for (const ref of c.references) {
				const desc = ref.description ? ` - ${ref.description}` : "";
				console.log(`      ${BLUE}${ref.type}${RESET}: ${ref.ref}${desc}`);
			}
		}

		console.log(`    ${DIM}because:${RESET}`);
		for (const why of c.because) {
			const condStr = Object.entries(why)
				.map(([k, v]) => `${k}=${JSON.stringify(v)}`)
				.join(", ");
			console.log(`      ${GREEN}•${RESET} when: { ${condStr} }`);
		}
		console.log();
	}
}

async function diff(factsPath: string, oldModelDir: string, newModelDir: string) {
	const repoRoot = findRepoRoot(process.cwd());
	const absoluteFactsPath = resolve(repoRoot, factsPath);

	if (!existsSync(absoluteFactsPath)) {
		console.error(`${RED}Error:${RESET} Facts file not found: ${factsPath}`);
		process.exit(2);
	}

	const facts = await loadYamlFile<Facts>(absoluteFactsPath);

	const oldPaths = modelPaths(repoRoot, oldModelDir);
	const newPaths = modelPaths(repoRoot, newModelDir);

	const oldVersion = await getModelVersion(repoRoot, oldModelDir);
	const newVersion = await getModelVersion(repoRoot, newModelDir);

	console.log(`${BOLD}Diff:${RESET} ${CYAN}${oldModelDir}${RESET} (${oldVersion}) → ${CYAN}${newModelDir}${RESET} (${newVersion})\n`);

	const oldResult = await evaluateFacts(facts, oldPaths);
	const newResult = await evaluateFacts(facts, newPaths);

	printControlsDiff(oldResult, newResult);
	printQuestionsDiff(oldResult, newResult);
	printDomainsDiff(oldResult, newResult);
}

function printControlsDiff(oldResult: EvaluateResult, newResult: EvaluateResult) {
	const oldControls = new Set(oldResult.derived_controls.map((c) => c.id));
	const newControls = new Set(newResult.derived_controls.map((c) => c.id));

	const added = [...newControls].filter((id) => !oldControls.has(id)).sort();
	const removed = [...oldControls].filter((id) => !newControls.has(id)).sort();

	console.log(`${BOLD}Controls:${RESET}`);
	if (added.length === 0 && removed.length === 0) {
		console.log(`${DIM}  - (no changes)${RESET}`);
	} else {
		if (added.length > 0) {
			console.log(`  ${GREEN}+ added (${added.length}):${RESET}`);
			for (const id of added) {
				const control = newResult.derived_controls.find((c) => c.id === id);
				console.log(`      ${id} - ${control?.title ?? "(unknown)"}`);
			}
		}
		if (removed.length > 0) {
			console.log(`  ${RED}- removed (${removed.length}):${RESET}`);
			for (const id of removed) {
				const control = oldResult.derived_controls.find((c) => c.id === id);
				console.log(`      ${id} - ${control?.title ?? "(unknown)"}`);
			}
		}
	}
	console.log();
}

function printQuestionsDiff(oldResult: EvaluateResult, newResult: EvaluateResult) {
	const oldMissing = new Set(oldResult.required_questions.filter((q) => !q.answered).map((q) => q.id));
	const newMissing = new Set(newResult.required_questions.filter((q) => !q.answered).map((q) => q.id));

	const newlyMissing = [...newMissing].filter((id) => !oldMissing.has(id)).sort();
	const noLongerMissing = [...oldMissing].filter((id) => !newMissing.has(id)).sort();

	console.log(`${BOLD}Required questions (missing):${RESET}`);
	if (newlyMissing.length === 0 && noLongerMissing.length === 0) {
		console.log(`${DIM}  - (no changes)${RESET}`);
	} else {
		if (newlyMissing.length > 0) {
			console.log(`  ${YELLOW}+ newly missing (${newlyMissing.length}):${RESET} ${newlyMissing.join(", ")}`);
		}
		if (noLongerMissing.length > 0) {
			console.log(`  ${GREEN}- no longer missing (${noLongerMissing.length}):${RESET} ${noLongerMissing.join(", ")}`);
		}
	}
	console.log();
}

function printDomainsDiff(oldResult: EvaluateResult, newResult: EvaluateResult) {
	const oldDomains = oldResult.activated_domains.join(", ");
	const newDomains = newResult.activated_domains.join(", ");

	console.log(`${BOLD}Activated domains:${RESET}`);
	if (oldDomains === newDomains) {
		console.log(`${DIM}  - (unchanged)${RESET} ${oldDomains}`);
	} else {
		console.log(`  ${RED}old:${RESET} ${oldDomains}`);
		console.log(`  ${GREEN}new:${RESET} ${newDomains}`);
	}
	console.log();
}

async function main() {
	const { values, positionals } = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			"model-dir": { type: "string", default: "model" },
			old: { type: "string" },
			new: { type: "string" },
			help: { type: "boolean", short: "h" },
		},
		allowPositionals: true,
	});

	if (values.help || positionals.length === 0) {
		console.log(`${BOLD}Risk Assistant CLI${RESET}

${BOLD}Usage:${RESET}
  bun tools/riskctl.ts evaluate <facts.yaml> [--model-dir model]
  bun tools/riskctl.ts diff <facts.yaml> --old model-v1 --new model-v2

${BOLD}Commands:${RESET}
  ${CYAN}evaluate${RESET}  Evaluate a facts file against a model
  ${CYAN}diff${RESET}      Compare outcomes between two model versions

${BOLD}Options:${RESET}
  --model-dir <dir>  Path to model directory (default: model)
  --old <dir>        Old model directory (for diff)
  --new <dir>        New model directory (for diff)
  -h, --help         Show this help message
`);
		process.exit(values.help ? 0 : 1);
	}

	const command = positionals[0];

	try {
		if (command === "evaluate") {
			const factsPath = positionals[1];
			if (!factsPath) {
				console.error(`${RED}Error:${RESET} Missing facts file argument\n`);
				console.error("Usage: bun tools/riskctl.ts evaluate <facts.yaml> [--model-dir model]");
				process.exit(1);
			}
			await evaluate(factsPath, values["model-dir"]!);
		} else if (command === "diff") {
			const factsPath = positionals[1];
			if (!factsPath || !values.old || !values.new) {
				console.error(`${RED}Error:${RESET} Missing required arguments\n`);
				console.error("Usage: bun tools/riskctl.ts diff <facts.yaml> --old model-v1 --new model-v2");
				process.exit(1);
			}
			await diff(factsPath, values.old, values.new);
		} else {
			console.error(`${RED}Error:${RESET} Unknown command '${command}'\n`);
			console.error("Available commands: evaluate, diff");
			console.error("Run with --help for usage information");
			process.exit(1);
		}
	} catch (error) {
		console.error(`${RED}Error:${RESET}`, error instanceof Error ? error.message : error);
		if (error instanceof Error && error.stack) {
			console.error(`\n${DIM}${error.stack}${RESET}`);
		}
		process.exit(1);
	}
}

main();
