import { Question } from './types';

export type GeneratorFunction = (skillId: string, level?: number) => Question;

class GeneratorRegistry {
    private static instance: GeneratorRegistry;
    private generators: Map<string, GeneratorFunction> = new Map();

    private constructor() {}

    static getInstance(): GeneratorRegistry {
        if (!GeneratorRegistry.instance) {
            GeneratorRegistry.instance = new GeneratorRegistry();
        }
        return GeneratorRegistry.instance;
    }

    register(skillId: string, generator: GeneratorFunction): void {
        this.generators.set(skillId, generator);
    }

    get(skillId: string): GeneratorFunction | undefined {
        return this.generators.get(skillId);
    }

    has(skillId: string): boolean {
        return this.generators.has(skillId);
    }

    getAllIds(): string[] {
        return Array.from(this.generators.keys());
    }
}

export const generatorRegistry = GeneratorRegistry.getInstance();
