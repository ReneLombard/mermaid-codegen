import * as fs from 'fs';
import * as path from 'path';
import { ProjectConfig } from './types/projectConfig';

export const CONFIG_FILE_NAME = 'mermaid-codegen.config.json';

const REQUIRED_FIELDS: (keyof ProjectConfig)[] = [
    'language',
    'mermaidDirectory',
    'templatesDirectory',
    'definitionsDirectory',
    'outputDirectory',
];

/**
 * Walks parent directories from startDir upward until it finds mermaid-codegen.config.json.
 * Throws with a clear, actionable error if not found or if required fields are missing/invalid.
 *
 * @returns The parsed ProjectConfig and the directory it was found in.
 */
export function resolveProjectConfig(startDir: string): { config: ProjectConfig; configDir: string } {
    let dir = path.resolve(startDir);
    const root = path.parse(dir).root;

    while (true) {
        const configPath = path.join(dir, CONFIG_FILE_NAME);

        if (fs.existsSync(configPath)) {
            let raw: unknown;
            try {
                raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch {
                throw new Error(`Failed to parse ${configPath}: file is not valid JSON.`);
            }

            const config = raw as Record<string, unknown>;
            const missingFields = REQUIRED_FIELDS.filter((f) => !config[f]);
            if (missingFields.length > 0) {
                throw new Error(
                    `Invalid ${CONFIG_FILE_NAME} at ${configPath}: missing required field(s): ${missingFields.join(', ')}.`,
                );
            }

            return { config: config as unknown as ProjectConfig, configDir: dir };
        }

        if (dir === root) {
            break;
        }

        dir = path.dirname(dir);
    }

    throw new Error(
        `No ${CONFIG_FILE_NAME} found.\nRun 'mermaid-codegen initialize -l <language> -d <directory>' to set up a project.`,
    );
}
