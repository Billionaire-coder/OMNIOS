export interface DBProject {
    id: string;
    name: string;
    active_page_id?: string;
    created_at: string;
    updated_at: string;
    version: number;
}

export interface DBPage {
    id: string;
    project_id: string;
    slug: string;
    title: string;
    root_element_id: string;
}

export interface DBElement {
    id: string;
    page_id: string;
    type: string;
    parent_id: string | null;
    index: number;
    props: any; // JSONB
    styles: any; // JSONB
    text_content: string | null;
}
