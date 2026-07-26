// configs/prisma.js
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('❌ DATABASE_URL environment variable is not set')
}

console.log('🔍 DATABASE_URL found:', {
    exists: true,
    preview: connectionString.substring(0, 20) + '...'
})

// Singleton pattern برای جلوگیری از چندین اتصال
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasourceUrl: connectionString,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// تابع تست اتصال
export async function testDatabaseConnection() {
    try {
        await prisma.$connect()
        console.log('✅ Database connected successfully!')
        
        // تست کوئری ساده
        const result = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db_name`
        console.log('✅ Database info:', result)
        
        return true
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        throw error
    }
}

export default prisma