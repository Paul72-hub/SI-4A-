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

export function getCourses() {
  return fetch(`${API_BASE_URL}/courses`).then((response) => handleResponse<CourseResponse[]>(response))
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
