import { ProjectState, Secret } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';

export class SecretsManager {
    private state: ProjectState;
    private setState: (state: ProjectState) => void;

    constructor(state: ProjectState, setState: (state: ProjectState) => void) {
        this.state = state;
        this.setState = setState;
    }

    createSecret(key: string, value: string): Secret {
        // Enforce UPPER_CASE keys convention
        const safeKey = key.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

        const newSecret: Secret = {
            id: uuidv4(),
            envId: 'default',
            keyName: safeKey,
            createdAt: Date.now()
            // value is no longer stored in state for security. 
            // Use SecretService for persistence.
        };

        const currentSecrets = this.state.data.secrets || [];

        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                secrets: [...currentSecrets, newSecret]
            }
        });

        return newSecret;
    }

    deleteSecret(id: string) {
        const currentSecrets = this.state.data.secrets || [];
        this.setState({
            ...this.state,
            data: {
                ...this.state.data,
                secrets: currentSecrets.filter(s => s.id !== id)
            }
        });
    }

    getSecretValue(key: string): string | undefined {
        // Legacy support: We cannot retrieve value from state anymore.
        // This method should be deprecated or use SecretService async.
        return undefined;
    }
}
