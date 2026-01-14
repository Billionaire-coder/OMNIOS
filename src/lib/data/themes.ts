import { ProjectState, DesignerElement, ThemeCategory } from "../../types/designer";
import { ZEUS } from "./themes/zeus";
import { POSEIDON } from "./themes/poseidon";
import { HADES } from "./themes/hades";
import { ATHENA } from "./themes/athena";
import { HERMES } from "./themes/hermes";
import { APHRODITE } from "./themes/aphrodite";
import { APOLLO } from "./themes/apollo";
import { ARTEMIS } from "./themes/artemis";
import { HEPHAESTUS } from "./themes/hephaestus";
import { ARES } from "./themes/ares";

export interface ThemeTemplate {
    id: string;
    name: string;
    category: ThemeCategory;
    description: string;
    thumbnail: string;
    state: ProjectState;
}

export const THEMES: ThemeTemplate[] = [
    ZEUS as ThemeTemplate,
    POSEIDON as ThemeTemplate,
    HADES as ThemeTemplate,
    ATHENA as ThemeTemplate,
    HERMES as ThemeTemplate,
    APHRODITE as ThemeTemplate,
    APOLLO as ThemeTemplate,
    ARTEMIS as ThemeTemplate,
    HEPHAESTUS as ThemeTemplate,
    ARES as ThemeTemplate
];
