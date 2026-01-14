
import { NextResponse } from 'next/server';
import { RunnerExecuteSchema } from '@/lib/validation/schemas';
import { PluginHost } from '@/lib/plugins/ServerPluginHost';
import { AppError } from '@/lib/error/AppError';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, inputs, env, permissions } = RunnerExecuteSchema.parse(body) as any;

        // Initialize Secure Host
        const host = new PluginHost({
            network: permissions?.network ?? false, // Default DENY
            allowedDomains: permissions?.allowedDomains ?? []
        });

        // Execute Code
        const result = await host.execute(
            code,
            {
                inputs: inputs || {},
                secrets: env || {} // Explicitly passed secrets only
            },
            5000 // 5s Timeout
        );

        return NextResponse.json({
            success: true,
            result: result
        });

    } catch (error: any) {
        console.error('[Runner] Execution Failed:', error);

        const status = error instanceof AppError ? error.statusCode : 500;
        const message = error instanceof AppError ? error.message : 'Internal Execution Error';

        return NextResponse.json({
            success: false,
            error: message
        }, { status });
    }
}
