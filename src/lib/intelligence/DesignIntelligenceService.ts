import { ProjectState, DesignerElement, DesignerPage } from '@/types/designer';
import { DesignIssue } from '@/types/intelligence';
import { ContrastChecker } from './rules/ContrastChecker';
import { SpecificationChecker } from './rules/SpecificationChecker';
import { LayoutOverflowChecker } from './rules/LayoutOverflowChecker';
import { ConsistencyChecker } from './rules/ConsistencyChecker';
import { DesignContext } from '@/types/intelligence';

export class DesignIntelligenceService {
    static analyze(state: ProjectState): DesignIssue[] {
        const issues: DesignIssue[] = [];

        // Analyze elements of the active page
        const activePage = state.pages[state.activePageId];
        if (!activePage) return issues;

        const context: DesignContext = {
            tokens: state.designSystem.tokens
        };

        const traverse = (elementId: string) => {
            const el = state.elements[elementId];
            if (!el) return;

            // Run Rules
            const contrastIssue = ContrastChecker.check(el);
            if (contrastIssue) issues.push(contrastIssue);

            const specIssue = SpecificationChecker.check(el);
            if (specIssue) issues.push(specIssue);

            const overflowIssue = LayoutOverflowChecker.check(el);
            if (overflowIssue) issues.push(overflowIssue);

            const consistencyIssue = ConsistencyChecker.check(el, context);
            if (consistencyIssue) issues.push(consistencyIssue);

            // Recurse
            if (el.children && el.children.length > 0) {
                el.children.forEach(childId => traverse(childId));
            }
        };

        if (activePage.rootElementId) {
            traverse(activePage.rootElementId);
        }

        return issues;
    }
}
