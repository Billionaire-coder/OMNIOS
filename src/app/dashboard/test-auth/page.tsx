
import { auth } from "@/auth"

export default async function ProtectedPage() {
    const session = await auth()

    if (!session) return <div>Access Denied</div>

    return (
        <div style={{ padding: 40, background: '#111', color: 'white', height: '100vh' }}>
            <h1>Protected Dashboard</h1>
            <p>Welcome, {session.user?.name}</p>
            <p>Role: {(session.user as any).role}</p>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
    )
}
