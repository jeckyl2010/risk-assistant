import fs from "node:fs/promises";
import yaml from "js-yaml";

export async function loadYamlFile<T = unknown>(filePath: string): Promise<T> {
  const text = await fs.readFile(filePath, "utf-8");
  return yaml.load(text) as T;
}

export function dumpYaml(doc: unknown): string {
  return yaml.dump(doc, {
    noRefs: true,
    lineWidth: 120,
    sortKeys: false,
  });
}
