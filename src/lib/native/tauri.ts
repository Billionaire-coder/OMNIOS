/**
 * Tauri Bridge
 * Handles direct communication with the Tauri Rust backend for OS-level access.
 */

// Mocking @tauri-apps/api/tauri and @tauri-apps/api/fs to stay environment-agnostic in dev
const invoke = async (name: string, args?: any) => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__TAURI__) {
        // @ts-ignore
        return window.__TAURI__.invoke(name, args);
    }
    console.log(`[Tauri-Mock] Invoking ${name}`, args);
    return null;
};

export class TauriBridge {
    static async saveToLocal(payload: string, filename: string = 'project.omnios'): Promise<boolean> {
        console.log(`[OS] Writing ${filename} to local storage...`);
        try {
            await invoke('save_file', { path: `./.omnios/${filename}`, content: payload });
            return true;
        } catch (e) {
            console.error('[OS] Save Failed:', e);
            return false;
        }
    }

    static async readLocal(filename: string): Promise<string | null> {
        try {
            return await invoke('read_file', { path: `./.omnios/${filename}` });
        } catch (e) {
            return null;
        }
    }

    static async setAppTitle(title: string) {
        await invoke('set_title', { title });
    }

    static async openDirectoryPicker(): Promise<string | null> {
        return await invoke('open_dir_dialog');
    }
}
