export class ComponentRegistry {
    private static instance: ComponentRegistry;
    private refs: Map<string, any> = new Map();

    private constructor() { }

    public static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry();
        }
        return ComponentRegistry.instance;
    }

    public register(id: string, ref: any) {
        this.refs.set(id, ref);
    }

    public unregister(id: string) {
        this.refs.delete(id);
    }

    public get(id: string) {
        return this.refs.get(id);
    }
}

export const componentRegistry = ComponentRegistry.getInstance();
