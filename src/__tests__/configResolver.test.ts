import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_FILE_NAME, resolveProjectConfig } from '../configResolver';

jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('resolveProjectConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockPath.resolve.mockImplementation((...args) => args.join('/'));
        mockPath.join.mockImplementation((...args) => args.join('/'));
        mockPath.dirname.mockImplementation((p) => {
            const parts = p.split('/');
            parts.pop();
            return parts.join('/') || '/';
        });
        mockPath.parse.mockImplementation((p) => ({ root: '/' }) as path.ParsedPath);
    });

    const validConfig = {
        language: 'C#',
        mermaidDirectory: 'docs',
        templatesDirectory: 'Templates/C#',
        definitionsDirectory: 'Definitions',
        outputDirectory: 'src',
    };

    it('finds mermaid-codegen.config.json in the start directory', () => {
        mockFs.existsSync.mockImplementation((p) => String(p).endsWith(CONFIG_FILE_NAME));
        mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig) as any);

        const result = resolveProjectConfig('/project');

        expect(result.config).toEqual(validConfig);
        expect(result.configDir).toBe('/project');
    });

    it('finds mermaid-codegen.config.json two levels up', () => {
        mockFs.existsSync.mockImplementation((p) => {
            const s = String(p);
            return s === `/project/${CONFIG_FILE_NAME}`;
        });
        mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig) as any);

        const result = resolveProjectConfig('/project/src/models');

        expect(result.config).toEqual(validConfig);
        expect(result.configDir).toBe('/project');
    });

    it('throws when config is not found anywhere', () => {
        mockFs.existsSync.mockReturnValue(false);

        expect(() => resolveProjectConfig('/project')).toThrow(`No ${CONFIG_FILE_NAME} found.`);
    });

    it('throws with a field-specific error when a required field is missing', () => {
        const incomplete = { ...validConfig, outputDirectory: undefined };
        mockFs.existsSync.mockImplementation((p) => String(p).endsWith(CONFIG_FILE_NAME));
        mockFs.readFileSync.mockReturnValue(JSON.stringify(incomplete) as any);

        expect(() => resolveProjectConfig('/project')).toThrow('missing required field(s): outputDirectory');
    });

    it('throws when config file contains malformed JSON', () => {
        mockFs.existsSync.mockImplementation((p) => String(p).endsWith(CONFIG_FILE_NAME));
        mockFs.readFileSync.mockReturnValue('{ not valid json' as any);

        expect(() => resolveProjectConfig('/project')).toThrow('file is not valid JSON');
    });
});
