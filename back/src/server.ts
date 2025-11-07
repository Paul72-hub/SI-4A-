import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const app = Fastify({ logger: true })
const prisma = new PrismaClient()

app.register(cors, { origin: true })

app.get('/health', async () => ({ status: 'ok' }))

app.get('/horses', async () => {
  return prisma.horse.findMany()
})

app.get('/courses', async () => {
  return prisma.course.findMany({
    include: {
      horse: true,
      rider: true,
      instructor: true,
    },
  })
})

const port = Number(process.env.PORT ?? 3000)

app
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`API ready on port ${port}`)
  })
  .catch((error) => {
    app.log.error(error)
    process.exit(1)
  })
