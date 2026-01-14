import { ProjectState } from '@/types/designer';
import { ProjectScaffolder } from '../export/ProjectScaffolder';
import { ProjectExporter } from './ProjectExporter';

export interface DeploymentResult {
    success: boolean;
    url?: string;
    error?: string;
    deploymentId?: string;
}

const VERCEL_API = 'https://api.vercel.com';

export const deployToVercel = async (
    project: ProjectState,
    token: string,
    onLog: (msg: string) => void,
    secrets?: { keyName: string, value: string }[]
): Promise<DeploymentResult> => {
    try {
        onLog("📦 Scaffolding project files...");
        const files = await ProjectScaffolder.scaffold(project);

        onLog("🚀 Registering project with Vercel...");
        const projectName = project.name.toLowerCase().replace(/\s+/g, '-');

        // 1. Ensure project exists
        const projectRes = await fetch(`${VERCEL_API}/v9/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: projectName,
                framework: 'nextjs',
            }),
        });

        // 409 means it already exists, which is fine
        if (!projectRes.ok && projectRes.status !== 409) {
            const err = await projectRes.json();
            throw new Error(`Project Creation Failed: ${err.error?.message || projectRes.statusText}`);
        }

        // 1b. Inject Secrets if provided
        if (secrets && secrets.length > 0) {
            onLog(`🔑 Injecting ${secrets.length} environment variables...`);
            for (const secret of secrets) {
                await fetch(`${VERCEL_API}/v9/projects/${projectName}/env`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        key: secret.keyName,
                        value: secret.value,
                        type: 'encrypted',
                        target: ['preview', 'production']
                    }),
                });
            }
        }

        onLog("📤 Uploading source and triggering deployment...");

        // 2. Format files for Vercel API v13
        const vercelFiles = Object.entries(files).map(([path, data]) => ({
            file: path,
            data: data
        }));

        // 3. Trigger Deployment
        const deployRes = await fetch(`${VERCEL_API}/v13/deployments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: projectName,
                files: vercelFiles,
                projectSettings: {
                    framework: 'nextjs',
                },
            }),
        });

        if (!deployRes.ok) {
            const err = await deployRes.json();
            throw new Error(`Deployment Failed: ${err.error?.message || deployRes.statusText}`);
        }

        const deployment = await deployRes.json();
        onLog(`✅ Deployment ${deployment.id} initiated.`);

        return {
            success: true,
            url: `https://${deployment.url}`,
            deploymentId: deployment.id
        };

    } catch (error: any) {
        onLog(`❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

export const pollDeploymentStatus = async (
    deploymentId: string,
    token: string,
    onLog: (msg: string) => void
): Promise<DeploymentResult> => {
    onLog("🔍 Polling deployment status...");

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch deployment status");

        const data = await res.json();
        onLog(`Status: ${data.status}...`);

        if (data.status === 'READY') {
            onLog("🎉 Deployment is LIVE!");
            return { success: true, url: `https://${data.url}` };
        }

        if (data.status === 'ERROR' || data.status === 'CANCELED') {
            throw new Error(`Deployment failed with status: ${data.status}`);
        }

        await new Promise(r => setTimeout(r, 2000));
    }
};

export const deployToNetlify = async (
    project: ProjectState,
    token: string,
    onLog: (msg: string) => void
): Promise<DeploymentResult> => {
    try {
        onLog("📦 Preparing ZIP bundle for Netlify...");
        const zipBlob = await ProjectExporter.prepareBuildBundle(project);

        onLog("🚀 Uploading to Netlify...");
        const res = await fetch('https://api.netlify.com/api/v1/sites', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/zip'
            },
            body: zipBlob
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Netlify Deploy Failed: ${err.message || res.statusText}`);
        }

        const data = await res.json();
        onLog(`✅ Site created: ${data.name}`);
        onLog(`🔗 URL: ${data.ssl_url || data.url}`);

        return {
            success: true,
            url: data.ssl_url || data.url,
            deploymentId: data.id
        };

    } catch (error: any) {
        onLog(`❌ Error: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

