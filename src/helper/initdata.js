import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

//handl
async function main() {
    try {
        // Delete all records
        await prisma.user.deleteMany();
        console.log("All records deleted successfully.");
    } catch (error) {
        console.error("Error deleting records:", error);
    }

    const createMany = await prisma.user.createMany(
        {
            data: [
                { username: 'admin', password: 'hutechveryverysecret666' },
                { username: 'guest', password: 'guest' }
            ]
        }
    )
}

main()

export {main}