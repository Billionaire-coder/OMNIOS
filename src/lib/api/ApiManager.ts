import { ProjectState, ApiRequest } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';

export class ApiManager {
    private state: ProjectState;
    private setState: (state: ProjectState) => void;

    constructor(state: ProjectState, setState: (state: ProjectState) => void) {
        this.state = state;
        this.setState = setState;
    }

    // --- CRUD OPERATIONS ---

    createRequest(name: string): ApiRequest {
        const newRequest: ApiRequest = {
            id: uuidv4(),
            name,
            method: 'GET',
            url: 'https://api.example.com/data',
            headers: [],
            params: [],
            bodyType: 'none',
            body: '{}'
        };

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                apiRequests: [...(this.state.data.apiRequests || []), newRequest]
            }
        });

        return newRequest;
    }

    updateRequest(id: string, updates: Partial<ApiRequest>) {
        const updatedRequests = (this.state.data.apiRequests || []).map(req =>
            req.id === id ? { ...req, ...updates } : req
        );

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                apiRequests: updatedRequests
            }
        });
    }

    deleteRequest(id: string) {
        const updatedRequests = (this.state.data.apiRequests || []).filter(req => req.id !== id);
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                apiRequests: updatedRequests
            }
        });
    }

    // --- EXECUTION ENGINE ---

    /**
     * Executes the API request with given variables.
     * @param requestId ID of the request to run
     * @param variables Dictionary of variables to inject into {{Handlebars}} slots
     */
    async executeRequest(requestId: string, variables: Record<string, any> = {}): Promise<any> {
        const request = (this.state.data.apiRequests || []).find(r => r.id === requestId);
        if (!request) throw new Error(`Request ${requestId} not found`);

        // 1. Interpolate URL
        let finalUrl = this.interpolate(request.url, variables);

        // 2. Append Query Params
        const urlObj = new URL(finalUrl);
        request.params.forEach(p => {
            if (p.key) urlObj.searchParams.append(p.key, this.interpolate(p.value, variables));
        });
        finalUrl = urlObj.toString();

        // 3. Prepare Headers
        const headers: Record<string, string> = {};
        request.headers.forEach(h => {
            if (h.key) headers[h.key] = this.interpolate(h.value, variables);
        });

        // 4. Prepare Body
        let body: any = undefined;
        if (request.method !== 'GET' && request.bodyType === 'json') {
            try {
                // Determine if body is a raw string or needs interpolation
                const rawBody = this.interpolate(request.body, variables);
                body = rawBody; // Fetch sends stringified JSON if headers set
                headers['Content-Type'] = 'application/json';
            } catch (e) {
                console.error("Failed to parse body JSON", e);
            }
        }

        // 5. Execute Fetch
        const startTime = Date.now();
        try {
            const res = await fetch(finalUrl, {
                method: request.method,
                headers,
                body
            });

            const endTime = Date.now();
            const duration = endTime - startTime;
            const status = res.status;

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                data = await res.text();
            }

            return {
                status,
                duration,
                data,
                headers: Object.fromEntries(res.headers.entries())
            };

        } catch (error: any) {
            return {
                status: 0,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }

    // Helper: Simple Mustache-like interpolation {{variable}}
    private interpolate(template: string, variables: Record<string, any>): string {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const val = variables[key.trim()];
            return val !== undefined ? String(val) : match;
        });
    }

    // --- OUTPUT TRANSFORMATION (Batch 3.2) ---

    // Resolve a path like "data.users[0].name" from an object
    private getByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => {
            if (acc === null || acc === undefined) return undefined;
            // Handle array syntax like users[0]
            if (part.includes('[') && part.endsWith(']')) {
                const [key, indexStr] = part.split('[');
                const index = parseInt(indexStr.replace(']', ''), 10);
                const arr = acc[key];
                return Array.isArray(arr) ? arr[index] : undefined;
            }
            return acc[part];
        }, obj);
    }

    /**
     * Extracts mapped outputs from the API response
     */
    extractOutputs(response: any, outputs: ApiRequest['outputs']): Record<string, any> {
        const result: Record<string, any> = {};

        outputs?.forEach(output => {
            try {
                const value = this.getByPath(response, output.path);
                if (value !== undefined) {
                    result[output.variableName] = value;
                    // Auto-update global variables in state (optional, for persistent storage)
                    // This creates or updates a variable that can be used elsewhere in the app
                    // We might need a separate method to commit these to state if we want them to persist
                }
            } catch (e) {
                console.warn(`Failed to extract output ${output.variableName} at path ${output.path}`, e);
            }
        });

        return result;
    }
}
