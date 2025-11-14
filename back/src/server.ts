import Fastify from 'fastify'
import cors from '@fastify/cors'
import {
  ConversationType,
  CourseStatus,
  HorseSex,
  HorseStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client'
import { z } from 'zod'

const app = Fastify({ logger: true })
const prisma = new PrismaClient()

app.register(cors, { origin: true })

app.get('/health', async () => ({ status: 'ok' }))

app.get('/horses', async () => {
  return prisma.horse.findMany()
})

app.post('/horses', async (request, reply) => {
  try {
    const payload = horseSchema.parse(request.body)

    const created = await prisma.horse.create({
      data: {
        name: payload.name,
        sex: payload.sex,
        breed: payload.breed ?? null,
        sireNumber: payload.sireNumber ?? null,
        birthDate: payload.birthDate ?? null,
        heightCm: payload.heightCm ?? null,
        weightKg: payload.weightKg ?? null,
        coat: payload.coat ?? null,
        imageUrl: payload.imageUrl ?? null,
        status: payload.status ?? HorseStatus.AVAILABLE,
        notes: payload.notes ?? null,
      },
    })

    return reply.code(201).send(created)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Données invalides', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return reply.code(400).send({ message: 'Numéro SIRE déjà utilisé' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la création du poney' })
  }
})

const horseParamsSchema = z.object({ id: z.coerce.number().int().positive() })

app.put('/horses/:id', async (request, reply) => {
  try {
    const { id } = horseParamsSchema.parse(request.params)
    const payload = horseSchema.partial().parse(request.body)

    const updated = await prisma.horse.update({
      where: { id },
      data: {
        name: payload.name,
        sex: payload.sex,
        breed: payload.breed,
        sireNumber: payload.sireNumber,
        birthDate: payload.birthDate,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        coat: payload.coat,
        imageUrl: payload.imageUrl,
        status: payload.status,
        notes: payload.notes,
      },
    })

    return reply.send(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Données invalides', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ message: 'Poney introuvable' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la mise à jour du poney' })
  }
})

app.delete('/horses/:id', async (request, reply) => {
  try {
    const { id } = horseParamsSchema.parse(request.params)
    await prisma.horse.delete({ where: { id } })
    return reply.code(204).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Identifiant invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ message: 'Poney introuvable' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la suppression du poney' })
  }
})

app.get('/users', async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      email: true,
      phone: true,
    },
  })
})

const coursesQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  userId: z.coerce.number().int().positive().optional(),
})

const horseSchema = z.object({
  name: z.string().min(1),
  sex: z.nativeEnum(HorseSex),
  breed: z.string().optional(),
  sireNumber: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  heightCm: z.number().int().positive().optional(),
  weightKg: z.number().int().positive().optional(),
  coat: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.nativeEnum(HorseStatus).optional(),
  notes: z.string().optional(),
})

app.get('/courses', async (request, reply) => {
  const parsed = coursesQuerySchema.safeParse(request.query)
  if (!parsed.success) {
    return reply.code(400).send({ message: 'Filtres invalides', issues: parsed.error.flatten() })
  }

  const { role, userId } = parsed.data

  if (role === 'CAVALIER' && !userId) {
    return reply.code(400).send({ message: 'userId requis pour un cavalier' })
  }

  const filters: Prisma.CourseWhereInput = {}
  if (role === 'CAVALIER' && userId) {
    filters.riderId = userId
  } else if (userId) {
    filters.riderId = userId
  }

  return prisma.course.findMany({
    where: filters,
    include: {
      horse: true,
      rider: true,
      instructor: true,
    },
  })
})

const courseSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  horseId: z.number().int().positive().optional(),
  riderId: z.number().int().positive().optional(),
  instructorId: z.number().int().positive().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
})

const baseCourseSchema = courseSchema.refine((data) => data.end > data.start, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['end'],
})

const partialCourseSchema = courseSchema.partial().refine(
  (data) => {
    if (!data.start || !data.end) {
      return true
    }
    return data.end > data.start
  },
  { message: 'La date de fin doit être postérieure à la date de début', path: ['end'] },
)

async function ensureHorseAvailability(horseId: number | undefined, start: Date, end: Date, excludeCourseId?: number) {
  if (!horseId) {
    return
  }

  const conflict = await prisma.course.findFirst({
    where: {
      horseId,
      id: excludeCourseId ? { not: excludeCourseId } : undefined,
      start: { lt: end },
      end: { gt: start },
    },
  })

  if (conflict) {
    throw new Error('Le poney est déjà réservé sur ce créneau')
  }
}

app.post('/courses', async (request, reply) => {
  try {
    const payload = baseCourseSchema.parse(request.body)
    await ensureHorseAvailability(payload.horseId ?? undefined, payload.start, payload.end)

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
  try {
    const { id } = paramsSchema.parse(request.params)
    const payload = partialCourseSchema.parse(request.body)

    const existingCourse = await prisma.course.findUnique({ where: { id } })
    if (!existingCourse) {
      return reply.code(404).send({ message: 'Cours introuvable' })
    }

    await ensureHorseAvailability(
      payload.horseId ?? existingCourse.horseId ?? undefined,
      payload.start ?? existingCourse.start,
      payload.end ?? existingCourse.end,
      id,
    )

    const updateData: Prisma.CourseUpdateInput = {}

    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.description !== undefined) updateData.description = payload.description ?? null
    if (payload.start !== undefined) updateData.start = payload.start
    if (payload.end !== undefined) updateData.end = payload.end
    if (payload.horseId !== undefined) updateData.horseId = payload.horseId ?? null
    if (payload.riderId !== undefined) updateData.riderId = payload.riderId ?? null
    if (payload.instructorId !== undefined) updateData.instructorId = payload.instructorId ?? null
    if (payload.status !== undefined) updateData.status = payload.status

    const updated = await prisma.course.update({
      where: { id },
      data: updateData,
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
  participantIds: z.array(z.number().int().positive()).optional(),
})

const conversationInclude = {
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
    },
  },
  participants: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  },
  _count: {
    select: { messages: true },
  },
} as const

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
    include: conversationInclude,
    orderBy: { createdAt: 'desc' },
  })

  return conversations
})

app.post('/conversations', async (request, reply) => {
  try {
    const payload = conversationSchema.parse(request.body)
    const participantIds = payload.participantIds ?? []

    const created = await prisma.conversation.create({
      data: {
        subject: payload.subject,
        kind: payload.kind ?? 'GENERAL',
        courseId: payload.courseId ?? null,
        createdById: payload.createdById ?? null,
      },
    })

    if (participantIds.length > 0) {
      const uniqueIds = [...new Set(participantIds)]
      await prisma.conversationParticipant.createMany({
        data: uniqueIds.map((userId) => ({
          conversationId: created.id,
          userId,
        })),
        skipDuplicates: true,
      })
    }

    const withParticipants = await prisma.conversation.findUnique({
      where: { id: created.id },
      include: conversationInclude,
    })

    return reply.code(201).send(withParticipants)
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

app.delete('/conversations/:id', async (request, reply) => {
  const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

  try {
    const { id } = paramsSchema.parse(request.params)
    await prisma.conversation.delete({ where: { id } })
    return reply.code(204).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ message: 'Identifiant invalide', issues: error.flatten() })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.code(404).send({ message: 'Conversation introuvable' })
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur lors de la suppression de la conversation' })
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

app.post('/login', async (request, reply) => {
  const credentials = loginSchema.safeParse(request.body)
  if (!credentials.success) {
    return reply.code(400).send({ message: 'Payload invalide', issues: credentials.error.flatten() })
  }

  const { email, password } = credentials.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.passwordHash !== password) {
      // à remplacer par un vrai hash/bcrypt plus tard
      return reply.code(401).send({ message: 'Identifiants invalides' })
    }

    return reply.send({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(500).send({ message: 'Erreur serveur' })
  }
})

app.post('/logout', async (_request, reply) => {
  return reply.code(204).send()
})
