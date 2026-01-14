import { ProjectState } from '@/types/designer';
import { ASTTransformer } from './transformer';
import * as Generator from './generator';
import * as Structure from './structure';

export interface CompiledFile {
    path: string;
    content: string;
}

export class ProjectCompiler {
    private transformer: ASTTransformer;
    private generator = Generator;
    private structure = Structure;
    private state: ProjectState;

    constructor(state: ProjectState) {
        this.state = state;
        this.transformer = new ASTTransformer(state);
    }

    public compileProject(projectName: string = 'omnios-export'): CompiledFile[] {
        const files: CompiledFile[] = [];

        // 1. Config Files (from structure.ts)
        const configFiles = this.structure.generateProjectConfig(projectName);
        Object.entries(configFiles).forEach(([path, content]) => {
            files.push({ path, content });
        });

        // 2. Pages
        if (this.state.pages && Object.keys(this.state.pages).length > 0) {
            Object.values(this.state.pages).forEach(page => {
                const rootId = page.rootElementId;
                const ast = this.transformer.generatePageAST(rootId);
                const content = this.generator.generateComponentCode('Page', ast);

                // Determine path (Home page vs routes)
                const folderPath = page.slug === '/' ? 'src/app/page.tsx' : `src/app/${page.slug}/page.tsx`;
                files.push({ path: folderPath, content });
            });
        }

        return files;
    }
}
