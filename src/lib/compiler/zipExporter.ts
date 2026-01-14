import JSZip from 'jszip';
import { ProjectState } from '@/types/designer';
import { ProjectCompiler } from './orchestrator';
import { AssetCollector } from './assetCollector';

export class ZipExporter {
    private compiler: ProjectCompiler;
    private assetCollector: AssetCollector;

    constructor(state: ProjectState) {
        this.compiler = new ProjectCompiler(state);
        this.assetCollector = new AssetCollector();
    }

    public async generateZip(projectName: string = 'omnios-export'): Promise<Blob> {
        const zip = new JSZip();

        // 1. Compile Code (Files)
        const files = this.compiler.compileProject(projectName);
        files.forEach(file => {
            zip.file(file.path, file.content);
        });

        // 2. Collect & Add Assets
        // Note: In a real environment, we need to fetch these blobs.
        // For now, we assume we have a way to get the blob from the URL.
        const assets = this.assetCollector.collectAssets(this.compiler['state']); // Accessing state private for now

        const assetPromises = assets.map(async (asset) => {
            try {
                // Determine exported path in public folder
                // e.g. public/assets/image.png
                const zipPath = `public/${asset.exportPath}`;

                // Fetch the content
                const response = await fetch(asset.originalUrl);
                const blob = await response.blob();

                zip.file(zipPath, blob);
            } catch (e) {
                console.error(`Failed to fetch asset ${asset.originalUrl}`, e);
                // Create a placeholder text file?
                zip.file(`public/${asset.exportPath}.error.txt`, `Failed to fetch: ${asset.originalUrl}`);
            }
        });

        await Promise.all(assetPromises);

        // 3. Generate Zip Blob
        const content = await zip.generateAsync({ type: 'blob' });
        return content;
    }
}
