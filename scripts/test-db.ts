
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing DB Access...')

    // Create User
    const user = await prisma.user.create({
        data: {
            email: `test-${Date.now()}@omnios.dev`,
            name: 'Test DB User',
            role: 'admin'
        },
    })
    console.log('Created User:', user.id)

    // Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Test Persistent Project',
            machineState: '{}',
            ownerId: user.id
        }
    })
    console.log('Created Project:', project.id)

    // Verify
    const count = await prisma.user.count()
    console.log(`Total Users: ${count}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
