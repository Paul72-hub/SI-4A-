import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ConversationType, CourseStatus, Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'

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

const baseCourseSchema = z
  .object({
    title: z.string().min(1, 'Le titre est obligatoire'),
    description: z.string().optional(),
    start: z.coerce.date(),
    end: z.coerce.date(),
    horseId: z.number().int().positive().optional(),
    riderId: z.number().int().positive().optional(),
    instructorId: z.number().int().positive().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
  })
  .refine((data) => data.end > data.start, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['end'],
  })

app.post('/courses', async (request, reply) => {
  try {
    const payload = baseCourseSchema.parse(request.body)

    const created = await prisma.course.create({
      data: {
        title: payload.title,
        description: payload.description,
        start: payload.start,
        end: payload.end,
        horseId: payload.horseId ?? null,
        riderId: payload.riderId ?? null,
        instructorId: payload.instructorId ?? null,
        status: payload.status,
      },
      include: {
        horse: true,
        rider: true,
        instructor: true,
      },
    })

    return reply.code(201).send(created)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Payload invalide', issues: error.flatten() })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la création du cours' })
  }
})

app.put('/courses/:id', async (request, reply) => {
  const paramsSchema = z.object({ id: z.coerce.number().int().positive() })
  const partialSchema = baseCourseSchema.partial().refine(
    (data) => {
      if (!data.start || !data.end) {
        return true
      }
      return data.end > data.start
    },
    { message: 'La date de fin doit être postérieure à la date de début', path: ['end'] },
  )

  try {
    const { id } = paramsSchema.parse(request.params)
    const payload = partialSchema.parse(request.body)

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: payload.title,
        description: payload.description,
        start: payload.start,
        end: payload.end,
        horseId: payload.horseId ?? null,
        riderId: payload.riderId ?? null,
        instructorId: payload.instructorId ?? null,
        status: payload.status,
      },
      include: {
        horse: true,
        rider: true,
        instructor: true,
      },
    })

    return reply.send(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Payload invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ message: 'Cours introuvable' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la mise à jour du cours' })
  }
})

app.delete('/courses/:id', async (request, reply) => {
  const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

  try {
    const { id } = paramsSchema.parse(request.params)
    await prisma.course.delete({ where: { id } })
    return reply.code(204).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Identifiant invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ message: 'Cours introuvable' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la suppression du cours' })
  }
})

const conversationSchema = z.object({
  subject: z.string().min(1, 'Le sujet est obligatoire'),
  kind: z.nativeEnum(ConversationType).optional(),
  courseId: z.number().int().positive().optional(),
  createdById: z.number().int().positive().optional(),
})

app.get('/conversations', async (request, reply) => {
  const querySchema = z.object({
    courseId: z.coerce.number().int().positive().optional(),
    kind: z.nativeEnum(ConversationType).optional(),
  })

  const filters = querySchema.safeParse(request.query)
  if (!filters.success) {
    return reply.code(400).send({ message: 'Filtres invalides', issues: filters.error.flatten() })
  }

  const { courseId, kind } = filters.data

  const conversations = await prisma.conversation.findMany({
    where: {
      courseId,
      kind,
    },
    include: {
      createdBy: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return conversations
})

app.post('/conversations', async (request, reply) => {
  try {
    const payload = conversationSchema.parse(request.body)

    const created = await prisma.conversation.create({
      data: {
        subject: payload.subject,
        kind: payload.kind ?? 'GENERAL',
        courseId: payload.courseId ?? null,
        createdById: payload.createdById ?? null,
      },
      include: {
        createdBy: true,
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return reply.code(201).send(created)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Payload invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return reply.code(400).send({ message: 'Identifiant de cours ou d’utilisateur invalide' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la création de la conversation' })
  }
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
const messageSchema = z.object({
  authorId: z.number().int().positive().optional(),
  content: z.string().min(1, 'Le contenu est obligatoire'),
  attachmentUrl: z.string().url().optional(),
})

app.get('/conversations/:id/messages', async (request, reply) => {
  const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

  try {
    const { id } = paramsSchema.parse(request.params)
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return messages
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Identifiant invalide', issues: error.flatten() })
    }
    return reply.code(500).send({ message: 'Erreur lors de la récupération des messages' })
  }
})

app.post('/conversations/:id/messages', async (request, reply) => {
  const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

  try {
    const { id } = paramsSchema.parse(request.params)
    const payload = messageSchema.parse(request.body)

    const created = await prisma.message.create({
      data: {
        conversationId: id,
        authorId: payload.authorId ?? null,
        content: payload.content,
        attachmentUrl: payload.attachmentUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return reply.code(201).send(created)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Payload invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return reply.code(400).send({ message: 'Conversation ou auteur inexistant' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de l’envoi du message' })
  }
})
