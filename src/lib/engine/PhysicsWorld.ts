
import RAPIER from '@dimforge/rapier2d-compat';

export interface PhysicsBodyDef {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isStatic?: boolean;
    restitution?: number; // Bounciness
}

export class PhysicsWorld {
    private static instance: PhysicsWorld;
    public initialized: boolean = false;
    private world: RAPIER.World | null = null;
    private bodies: Map<string, RAPIER.RigidBody> = new Map();

    private constructor() { }

    public static getInstance() {
        if (!PhysicsWorld.instance) {
            PhysicsWorld.instance = new PhysicsWorld();
        }
        return PhysicsWorld.instance;
    }

    async init() {
        if (this.initialized) return;
        try {
            await RAPIER.init(); // Load WASM
            const gravity = { x: 0.0, y: 9.81 * 100 }; // 981 pixels/s^2 down
            this.world = new RAPIER.World(gravity);
            this.initialized = true;
            console.log("[PhysicsWorld] Rapier2D Initialized.");
        } catch (e) {
            console.error("[PhysicsWorld] Failed to init Rapier:", e);
        }
    }

    addBody(def: PhysicsBodyDef) {
        if (!this.world) return;

        // Remove existing
        this.removeBody(def.id);

        const rigidBodyDesc = def.isStatic
            ? RAPIER.RigidBodyDesc.fixed()
            : RAPIER.RigidBodyDesc.dynamic();

        rigidBodyDesc.setTranslation(def.x + def.width / 2, def.y + def.height / 2); // Center of mass

        const body = this.world.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(def.width / 2, def.height / 2); // Half-extents
        colliderDesc.setRestitution(def.restitution || 0.1);

        this.world.createCollider(colliderDesc, body);

        this.bodies.set(def.id, body);
    }

    removeBody(id: string) {
        if (!this.world) return;
        const body = this.bodies.get(id);
        if (body) {
            this.world.removeRigidBody(body);
            this.bodies.delete(id);
        }
    }

    step(dtSeconds: number) {
        if (!this.world) return;
        this.world.step(); // Rapier fixed step logic can be tuned, default is 60hz usually, we force step
    }

    getTransform(id: string) {
        const body = this.bodies.get(id);
        if (!body) return null;

        const pos = body.translation();
        const rot = body.rotation();

        // Convert center-of-mass back to top-left
        // Need to know dimensions... store them or just assume center used for rendering?
        // Let's assume the caller knows the dimensions or we store them. A simpler approach is returning Center.
        return { x: pos.x, y: pos.y, rotation: rot };
    }

    // Batch 14.1 Helper: Run full simulation
    simulateDrop(iterations = 60) {
        for (let i = 0; i < iterations; i++) {
            this.step(0.016);
        }
    }
}

export const physicsWorld = PhysicsWorld.getInstance();
