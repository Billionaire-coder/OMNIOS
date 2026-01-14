import { ProjectState } from "@/types/designer";
import { SourceCompiler } from "./SourceCompiler";

/**
 * ASTCompiler uses ts-morph to generate robust TypeScript code for the project export.
 * Uses dynamic imports to avoid bundling node-specific code in the main client bundle.
 */
export class ASTCompiler {
    /**
     * Generates Master Component files using AST manipulation.
     */
    static async compileMasterComponents(project: ProjectState): Promise<Record<string, string>> {
        // Dynamic import to isolate ts-morph
        const { Project, ScriptTarget, ModuleKind } = await import("ts-morph");

        // Initialize an in-memory ts-morph project
        const tsProject = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                target: ScriptTarget.ESNext,
                module: ModuleKind.ESNext,
                jsx: 1 // JsxEmit.Preserve
            }
        });

        const files: Record<string, string> = {};

        if (!project.designSystem || !project.designSystem.components) {
            return files;
        }

        project.designSystem.components.forEach(comp => {
            const componentName = comp.name.replace(/\s+/g, '');
            const fileName = `components/ui/${componentName}.tsx`;

            // Create the source file
            const sourceFile = tsProject.createSourceFile(fileName, "", { overwrite: true });

            // 1. Add Imports
            sourceFile.addImportDeclaration({
                defaultImport: "React",
                moduleSpecifier: "react"
            });

            // 2. Define Props Interface
            sourceFile.addInterface({
                name: `${componentName}Props`,
                isExported: false,
                properties: [
                    { name: "className", type: "string", hasQuestionToken: true }
                ]
            });

            // 3. Generate JSX Body using existing SourceCompiler logic
            const jsxBody = SourceCompiler.compileElementToJSX(comp.rootElementId, project, 2);

            // 4. Create Component Function
            sourceFile.addFunction({
                name: componentName,
                isExported: true,
                parameters: [
                    { name: "{ className }", type: `${componentName}Props` }
                ],
                statements: [
                    `return (`,
                    `${jsxBody}`,
                    `);`
                ]
            });

            // 5. Format and Save
            sourceFile.formatText({
                indentSize: 2,
                ensureNewLineAtEndOfFile: true
            });

            files[fileName] = sourceFile.getFullText();
        });

        return files;
    }

    /**
     * Generates Page files using AST manipulation.
     */
    static async compilePages(project: ProjectState): Promise<Record<string, string>> {
        const { Project, ScriptTarget, ModuleKind } = await import("ts-morph");

        const tsProject = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                target: ScriptTarget.ESNext,
                module: ModuleKind.ESNext,
                jsx: 1
            }
        });

        const files: Record<string, string> = {};

        // Helper to compile logic for a page
        const compileLogic = (pageId: string) => {
            const result = {
                statements: [] as string[],
                imports: [] as { named?: string[], default?: string, module: string }[],
                eventBindings: {} as Record<string, string>
            };

            if (project.blueprints) {
                Object.values(project.blueprints).forEach(bp => {
                    // Transpile Variables
                    const varNodes = Object.values(bp.nodes).filter((n: any) => n.type === 'variable');
                    varNodes.forEach((node: any) => {
                        const varName = node.data?.name || `var_${node.id}`;
                        const initVal = JSON.stringify(node.data?.initialValue ?? null);
                        result.statements.push(`const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = React.useState(${initVal});`);
                    });

                    // Transpile OnLoad
                    const loadNodes = Object.values(bp.nodes).filter((n: any) => n.type === 'trigger_on_load');
                    loadNodes.forEach((node: any) => {
                        const connections = bp.connections.filter((c: any) => c.fromId === node.id);
                        result.statements.push(`
                            useEffect(() => {
                                ${this.transpileFlow(bp, connections)}
                            }, []);
                        `);
                    });

                    // Transpile OnClick
                    const clickNodes = Object.values(bp.nodes).filter((n: any) => n.type === 'on_click');
                    clickNodes.forEach((node: any) => {
                        const targetId = node.data.targetId;
                        if (!targetId) return;

                        const handlerName = `handleClick_${node.id.replace(/-/g, '_')}`;
                        const connections = bp.connections.filter((c: any) => c.fromId === node.id);

                        result.statements.push(`
                           const ${handlerName} = (e: React.MouseEvent) => {
                               e.stopPropagation();
                               ${this.transpileFlow(bp, connections)}
                           };
                       `);

                        result.eventBindings[targetId] = handlerName;
                    });
                });
            }

            return result;
        };

        Object.values(project.pages).forEach(page => {
            const path = page.path === '/' ? 'app/page.tsx' : `app/${page.path.replace(/^\//, '')}/page.tsx`;
            const sourceFile = tsProject.createSourceFile(path, "", { overwrite: true });

            // Transpile Logic
            const logic = compileLogic(page.id);

            // 1. Add Standard Imports
            sourceFile.addImportDeclaration({
                defaultImport: "React",
                namedImports: ["useEffect", "useState", ...logic.imports.flatMap(i => i.named || [])],
                moduleSpecifier: "react"
            });

            sourceFile.addImportDeclaration({
                namedImports: ["useLogicEngine"],
                moduleSpecifier: "@/lib/runtime/LogicEngine"
            });

            // Add other logic imports
            logic.imports.forEach(imp => {
                if (imp.module !== 'react') {
                    sourceFile.addImportDeclaration({
                        defaultImport: imp.default,
                        namedImports: imp.named,
                        moduleSpecifier: imp.module
                    });
                }
            });

            // 2. Add Component Imports
            const usedComponentIds = new Set<string>();
            const traverse = (elId: string) => {
                const el = project.elements[elId];
                if (!el) return;
                if (el.masterComponentId) usedComponentIds.add(el.masterComponentId);
                (el.children || []).forEach(traverse);
            };
            traverse(page.rootElementId);

            usedComponentIds.forEach(id => {
                const comp = project.designSystem.components.find(c => id === c.id);
                if (comp) {
                    const name = comp.name.replace(/\s+/g, '');
                    sourceFile.addImportDeclaration({
                        namedImports: [name],
                        moduleSpecifier: `@/components/ui/${name}`
                    });
                }
            });

            // 3. Generate Body with Event Bindings
            const body = SourceCompiler.compileElementToJSX(page.rootElementId, project, 2, logic.eventBindings);

            // 4. Create Page Component
            sourceFile.addFunction({
                name: "Page",
                isExported: true,
                isDefaultExport: true,
                statements: [
                    "const { executeBlueprint } = useLogicEngine();",
                    "",
                    ...logic.statements, // Inject transpiled logic
                    "",
                    "return (",
                    "  <main>",
                    body,
                    "  </main>",
                    ");"
                ]
            });

            // 5. Add "use client" directive
            sourceFile.insertText(0, '"use client";\n');

            sourceFile.formatText({
                indentSize: 2,
                ensureNewLineAtEndOfFile: true
            });

            files[path] = sourceFile.getFullText();
        });

        return files;
    }

    private static transpileFlow(bp: any, connections: any[]): string {
        let code = '';
        connections.forEach((conn: any) => {
            const nextNode = bp.nodes[conn.toId];
            if (!nextNode) return;

            if (nextNode.type === 'alert') {
                const msg = nextNode.data?.message || 'Hello';
                code += `alert("${msg}");\n`;
            } else if (nextNode.type === 'navigate') {
                const url = nextNode.data?.url || '/';
                code += `window.location.href = "${url}";\n`;
            } else if (nextNode.type === 'set_var') {
                const varName = nextNode.data?.varName;
                const value = JSON.stringify(nextNode.data?.value);
                // Assuming varName matches the state name (simple resolution for MVP)
                if (varName) {
                    code += `set${varName.charAt(0).toUpperCase() + varName.slice(1)}(${value});\n`;
                }
            }

            // Recurse for simple linear flow
            const nextConns = bp.connections.filter((c: any) => c.fromId === nextNode.id);
            if (nextConns.length > 0) {
                code += this.transpileFlow(bp, nextConns);
            }
        });
        return code;
    }
}
