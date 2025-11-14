const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return response.json().catch(() => ({})).then((body) => {
      const message = body?.message ?? 'Erreur serveur'
      throw new Error(message)
    })
  }
  return response.json() as Promise<T>
}

export function getCourses(params?: CourseQueryParams) {
  const query = new URLSearchParams()
  if (params?.role) query.set('role', params.role)
  if (params?.userId) query.set('userId', String(params.userId))

  const url = `${API_BASE_URL}/courses${query.toString() ? `?${query}` : ''}`
  return fetch(url).then((response) => handleResponse<CourseResponse[]>(response))
}

export function createCourse(payload: CreateCoursePayload) {
  return fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<CourseResponse>(response))
}

export function updateCourse(id: number, payload: UpdateCoursePayload) {
  return fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<CourseResponse>(response))
}

export function deleteCourse(id: number) {
  return fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Impossible de supprimer le cours')
    }
    return true
  })
}

export function getConversations(params?: ConversationQueryParams) {
  const query = new URLSearchParams()
  if (params?.courseId) query.set('courseId', String(params.courseId))
  if (params?.kind) query.set('kind', params.kind)

  const url = `${API_BASE_URL}/conversations${query.toString() ? `?${query}` : ''}`
  return fetch(url).then((response) => handleResponse<ConversationResponse[]>(response))
}

export function createConversation(payload: CreateConversationPayload) {
  return fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<ConversationResponse>(response))
}

export function getMessages(conversationId: number) {
  return fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`).then((response) =>
    handleResponse<MessageResponse[]>(response),
  )
}

export function sendMessage(conversationId: number, payload: SendMessagePayload) {
  return fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<MessageResponse>(response))
}

export function deleteConversation(id: number) {
  return fetch(`${API_BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Impossible de supprimer la conversation')
    }
    return true
  })
}

export function getUsers() {
  return fetch(`${API_BASE_URL}/users`).then((response) => handleResponse<UserResponse[]>(response))
}

export function getHorses() {
  return fetch(`${API_BASE_URL}/horses`).then((response) => handleResponse<HorseResponse[]>(response))
}

export function createHorse(payload: HorsePayload) {
  return fetch(`${API_BASE_URL}/horses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<HorseResponse>(response))
}

export function updateHorse(id: number, payload: HorsePayload) {
  return fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((response) => handleResponse<HorseResponse>(response))
}

export function deleteHorse(id: number) {
  return fetch(`${API_BASE_URL}/horses/${id}`, {
    method: 'DELETE',
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Impossible de supprimer le poney')
    }
    return true
  })
}

export type CourseResponse = {
  id: number
  title: string
  description?: string | null
  start: string
  end: string
  status: string
  horse?: { id: number; name: string } | null
  rider?: { id: number; firstName: string; lastName: string } | null
  instructor?: { id: number; firstName: string; lastName: string } | null
}

export type CreateCoursePayload = {
  title: string
  description?: string
  start: string
  end: string
  status?: string
  horseId?: number | null
  riderId?: number | null
  instructorId?: number | null
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>

export type CourseQueryParams = {
  role?: string
  userId?: number
}

export type ConversationResponse = {
  id: number
  subject: string
  kind: ConversationKind
  course?: { id: number; title: string } | null
  createdBy?: { id: number; firstName: string; lastName: string } | null
  createdAt: string
  participants?: ConversationParticipantResponse[]
  _count?: { messages: number }
}

export type ConversationParticipantResponse = {
  id: number
  user: {
    id: number
    firstName: string
    lastName: string
    role: string
  }
}

export type ConversationKind = 'GENERAL' | 'COURS' | 'ALERT'

export type ConversationQueryParams = {
  courseId?: number
  kind?: ConversationKind
}

export type CreateConversationPayload = {
  subject: string
  kind?: ConversationKind
  courseId?: number | null
  createdById?: number | null
  participantIds?: number[]
}

export type MessageResponse = {
  id: number
  conversationId: number
  author?: { id: number; firstName: string; lastName: string } | null
  content: string
  attachmentUrl?: string | null
  createdAt: string
}

export type SendMessagePayload = {
  authorId?: number
  content: string
  attachmentUrl?: string
}

export type UserResponse = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string | null
}

export type HorseResponse = {
  id: number
  name: string
  sex: string
  breed?: string | null
  sireNumber?: string | null
  birthDate?: string | null
  heightCm?: number | null
  weightKg?: number | null
  coat?: string | null
  imageUrl?: string | null
  status: string
  notes?: string | null
}

export type HorsePayload = {
  name: string
  sex: string
  breed?: string
  sireNumber?: string
  birthDate?: string
  heightCm?: number
  weightKg?: number
  coat?: string
  imageUrl?: string
  status?: string
  notes?: string
}
