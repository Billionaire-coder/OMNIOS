import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { HyperCommand } from "@/types/designer";

class CollabService {
    private doc: Y.Doc;
    private provider: WebsocketProvider | null = null;
    private commandLog: Y.Array<string>;
    private commandHandlers: Set<(command: HyperCommand) => void> = new Set();
    private userId: string;

    constructor() {
        this.doc = new Y.Doc();
        this.commandLog = this.doc.getArray('commands');
        this.userId = Math.random().toString(36).substr(2, 9);

        // Listen for new commands from peers
        this.commandLog.observe(event => {
            event.changes.added.forEach(item => {
                // @ts-ignore
                const commandStr = item.content.getContent()[0];
                try {
                    const command: HyperCommand = JSON.parse(commandStr);
                    // Filter out our own commands (optional, but usually Yjs handles this)
                    // if (command.userId !== this.userId) ...
                    this.commandHandlers.forEach(handler => handler(command));
                } catch (e) {
                    console.error("Failed to parse collaborative command", e);
                }
            });
        });
    }

    public init(roomId: string = 'omnios-default') {
        if (typeof window === 'undefined') return;

        // Connect to the signaling server (from collab-server.js)
        this.provider = new WebsocketProvider('ws://localhost:1234', roomId, this.doc);

        this.provider.on('status', (event: any) => {
            console.log(`[Collab] Connection status: ${event.status}`);
        });
    }

    /**
     * Broadcast a command to all connected peers.
     */
    public broadcastCommand(command: HyperCommand) {
        // Tag command with user ID to avoid double-application if needed
        // Inject timestamp for conflict resolution (Last Write Wins)
        const taggedCommand = { ...command, userId: this.userId, timestamp: Date.now() };
        this.commandLog.push([JSON.stringify(taggedCommand)]);
    }

    /**
     * Subscribe to incoming commands from other users.
     */
    public onCommand(handler: (command: HyperCommand) => void) {
        this.commandHandlers.add(handler);
        return () => this.commandHandlers.delete(handler);
    }

    /**
     * Update local presence data (cursor, selection, etc.)
     */
    public updatePresence(data: { cursor?: { x: number, y: number }, selection?: string[], name?: string, color?: string, viewport?: { x: number, y: number, scale: number } }) {
        if (!this.provider) return;
        this.provider.awareness.setLocalStateField('user', {
            id: this.userId,
            name: data.name || `User ${this.userId.slice(0, 4)}`,
            color: data.color || '#3b82f6',
            ...data
        });
    }

    /**
     * Listen for changes in peer presence.
     */
    public onPresenceUpdate(handler: (states: any[]) => void) {
        if (!this.provider) return () => { };

        const updateHandler = () => {
            const states = Array.from(this.provider!.awareness.getStates().values());
            handler(states);
        };

        this.provider.awareness.on('change', updateHandler);
        return () => this.provider?.awareness.off('change', updateHandler);
    }

    public getUserId() {
        return this.userId;
    }

    public destroy() {
        this.provider?.destroy();
        this.doc.destroy();
    }
}

export const collabService = new CollabService();
