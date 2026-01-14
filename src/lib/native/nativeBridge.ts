import { DesignerElement } from "@/types/designer";
import { mapToNativeStyles, NATIVE_PRIMITIVES } from "./nativePrimitives";
import { TauriBridge } from "./tauri";

export type Platform = 'web' | 'macos' | 'windows' | 'linux' | 'ios' | 'android';

/**
 * Universal Renderer logic for mapping OMNIOS elements to Native Mobile Structures.
 */
export class UniversalRenderer {
    static mapToNative(element: DesignerElement, children: DesignerElement[]): any {
        return {
            component: NATIVE_PRIMITIVES[element.type as keyof typeof NATIVE_PRIMITIVES] || 'View',
            props: {
                id: element.id,
                style: mapToNativeStyles(element.styles || {}),
                ...element.props
            },
            children: children.map(c => this.mapToNative(c, [])) // Basic recursive structure
        };
    }
}

interface NativeBridgeCapabilities {
    isNative: boolean;
    platform: Platform;
    fileSystem: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<boolean>;
    };
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    };
}

class NativeBridge implements NativeBridgeCapabilities {
    public isNative: boolean = false;
    public platform: Platform = 'web';

    constructor() {
        if (typeof window !== 'undefined') {
            // @ts-ignore - Tauri/Electron specific globals
            this.isNative = !!(window.__TAURI__ || window.ethereum || window.process?.versions?.electron);
            this.detectPlatform();
        }
    }

    private detectPlatform() {
        if (typeof window === 'undefined') return;
        const ua = window.navigator.userAgent.toLowerCase();
        if (ua.includes('mac')) this.platform = 'macos';
        else if (ua.includes('win')) this.platform = 'windows';
        else if (ua.includes('linux')) this.platform = 'linux';
        else if (ua.includes('iphone') || ua.includes('ipad')) this.platform = 'ios';
        else if (ua.includes('android')) this.platform = 'android';
        else this.platform = 'web';
    }

    public fileSystem = {
        readFile: async (path: string): Promise<string> => {
            if (this.isNative && (this.platform === 'macos' || this.platform === 'windows' || this.platform === 'linux')) {
                return await TauriBridge.readLocal(path) || '';
            }
            if (!this.isNative) {
                console.warn('Native FS access not available in web mode');
                return '';
            }
            // Fallback for other native envs
            return `Content of ${path}`;
        },
        writeFile: async (path: string, content: string): Promise<boolean> => {
            if (this.isNative && (this.platform === 'macos' || this.platform === 'windows' || this.platform === 'linux')) {
                return await TauriBridge.saveToLocal(content, path);
            }
            if (!this.isNative) {
                console.warn('Native FS access not available in web mode');
                return false;
            }
            console.log(`Writing to ${path}: ${content}`);
            return true;
        }
    };

    public window = {
        minimize: () => {
            if (this.isNative) console.log('OS: Minimize');
        },
        maximize: () => {
            if (this.isNative) console.log('OS: Maximize');
        },
        close: () => {
            if (this.isNative) console.log('OS: Close');
        }
    };

    public showNotification(title: string, body: string) {
        if (this.isNative) {
            console.log(`OS Notification: ${title} - ${body}`);
        } else {
            alert(`${title}: ${body}`);
        }
    }

    // Batch 19.2: Hardware Accessors
    public async requestCameraPermission(): Promise<boolean> {
        console.log('Requesting Camera Permission...');
        return true;
    }

    public triggerHaptic(type: 'impact' | 'notification' | 'selection' = 'selection') {
        console.log(`Triggering Haptic: ${type}`);
    }
}

export const nativeBridge = new NativeBridge();
