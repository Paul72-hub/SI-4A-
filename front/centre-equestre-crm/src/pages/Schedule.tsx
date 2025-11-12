import React, { useEffect, useMemo, useState } from "react"
import "../styles/Schedule.scss"
import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
  type CourseResponse,
} from "../services/api"

const weekDays = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

const hours = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 8
  return `${hour.toString().padStart(2, '0')}:00`
})

type SlotSelection = {
  dayIndex: number
  hour: string
}

type CourseFormState = {
  title: string
  description: string
  duration: number
  status: CourseResponse['status']
}

const defaultFormState: CourseFormState = {
  title: '',
  description: '',
  duration: 60,
  status: 'PLANNED',
}

type FormMode = 'create' | 'edit'

export function SchedulePage() {
  const weekStart = useMemo(() => {
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek)
    monday.setHours(0, 0, 0, 0)
    return monday
  }, [])

  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formState, setFormState] = useState<CourseFormState>(defaultFormState)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)

  useEffect(() => {
    refreshCourses()
  }, [])

  const refreshCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de récupérer les cours')
    } finally {
      setLoading(false)
    }
  }

  const buildSlotDate = (slot: SlotSelection) => {
    const slotDate = new Date(weekStart)
    slotDate.setDate(weekStart.getDate() + slot.dayIndex)
    const hourValue = parseInt(slot.hour.split(':')[0] ?? '0', 10)
    slotDate.setHours(hourValue, 0, 0, 0)
    return slotDate
  }

  const openFormForSlot = (slot: SlotSelection) => {
    setSelectedSlot(slot)
    setFormMode('create')
    setEditingCourse(null)
    setFormState(defaultFormState)
    setIsFormOpen(true)
    setFeedback(null)
  }

  const openFormForCourse = (course: CourseResponse) => {
    const courseDate = new Date(course.start)
    const dayIndex = Math.round(
      (courseDate.setHours(0, 0, 0, 0) - weekStart.getTime()) / (1000 * 60 * 60 * 24),
    )
    const hour = courseDate.getHours().toString().padStart(2, '0') + ':00'

    const durationMinutes = Math.max(
      30,
      Math.round((new Date(course.end).getTime() - new Date(course.start).getTime()) / 60000),
    )

    setSelectedSlot({ dayIndex, hour })
    setFormMode('edit')
    setEditingCourse(course)
    setFormState({
      title: course.title,
      description: course.description ?? '',
      duration: durationMinutes,
      status: course.status,
    })
    setIsFormOpen(true)
    setFeedback(null)
  }

  const closeForm = () => {
    setSelectedSlot(null)
    setIsFormOpen(false)
    setFormState(defaultFormState)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSlot) return

    const startDate = buildSlotDate(selectedSlot)
    const endDate = new Date(startDate.getTime() + formState.duration * 60000)

    try {
      setSubmitting(true)
      setFeedback(null)
      if (formMode === 'edit' && editingCourse) {
        await updateCourse(editingCourse.id, {
          title: formState.title,
          description: formState.description || undefined,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          status: formState.status,
        })
      } else {
        await createCourse({
          title: formState.title,
          description: formState.description || undefined,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          status: formState.status,
        })
      }
      await refreshCourses()
      closeForm()
      setFeedback(formMode === 'edit' ? 'Cours mis à jour' : 'Cours ajouté avec succès')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Impossible de créer le cours')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCourse) return
    try {
      setSubmitting(true)
      setFeedback(null)
      await deleteCourse(editingCourse.id)
      await refreshCourses()
      closeForm()
      setFeedback('Cours supprimé')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Suppression impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const coursesForSlot = (slot: SlotSelection) => {
    return courses.filter((course) => {
      const courseDate = new Date(course.start)
      const slotDate = buildSlotDate(slot)
      return (
        courseDate.getFullYear() === slotDate.getFullYear() &&
        courseDate.getMonth() === slotDate.getMonth() &&
        courseDate.getDate() === slotDate.getDate() &&
        courseDate.getHours() === slotDate.getHours()
      )
    })
  }

  return (
    <section className="schedule-page">
      <header>
        <h2>Agenda hebdomadaire</h2>
        <p>Visualisation des creneaux horaires disponibles pour planifier les seances cheval et cavalier.</p>
        <div className="schedule-instructions">
          Clic gauche sur un créneau pour ajouter un cours. Cliquez sur un cours existant pour le modifier ou le supprimer.
        </div>
      </header>

      {feedback && <div className="schedule-feedback">{feedback}</div>}
      {loading && <div className="schedule-loading">Chargement de l&apos;agenda...</div>}
      {error && <div className="schedule-error">Erreur : {error}</div>}

      <div className="calendar-legend">
        <strong>Statut des cours :</strong>
        <span className="legend-item">
          <span className="legend-color planned" />
          Planifié
        </span>
        <span className="legend-item">
          <span className="legend-color confirmed" />
          Confirmé
        </span>
        <span className="legend-item">
          <span className="legend-color cancelled" />
          Annulé
        </span>
      </div>

      <div className="calendar-wrapper" role="grid">
        <div className="calendar-grid">
          <div className="calendar-cell header-corner" aria-hidden="true" />
          {weekDays.map((day) => (
            <div key={day} className="calendar-cell header-day" role="columnheader">
              {day}
            </div>
          ))}

          {hours.map((hour) => (
            <div key={hour} className="calendar-row" role="row">
              <div className="calendar-cell header-hour" role="rowheader">
                {hour}
              </div>
              {weekDays.map((day, dayIndex) => {
                const slot = { dayIndex, hour }
                const slotCourses = coursesForSlot(slot)
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="calendar-cell slot slot-trigger"
                    role="gridcell"
                    tabIndex={0}
                    aria-label={`${day} ${hour}`}
                    onClick={() => openFormForSlot(slot)}
                  >
                    {slotCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        className={`course-tag status-${course.status.toLowerCase()}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          openFormForCourse(course)
                        }}
                      >
                        {course.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && selectedSlot && (
        <div className="course-form-overlay">
          <form className="course-form" onSubmit={handleSubmit}>
            <h3>{formMode === 'edit' ? 'Modifier le cours' : 'Ajouter un cours'}</h3>
            <p>Créneau sélectionné : {weekDays[selectedSlot.dayIndex]} à {selectedSlot.hour}</p>

            <label>
              Titre du cours
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                rows={3}
              />
            </label>

            <label>
              Durée (minutes)
              <select name="duration" value={formState.duration} onChange={handleFormChange}>
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </label>

            <label>
              Statut
              <select name="status" value={formState.status} onChange={handleFormChange}>
                <option value="PLANNED">Planifié</option>
                <option value="CONFIRMED">Confirmé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </label>

            <div className="course-form-actions">
              {formMode === 'edit' && (
                <button type="button" className="btn-danger" onClick={handleDelete} disabled={submitting}>
                  Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={submitting}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enregistrement...' : formMode === 'edit' ? 'Mettre à jour' : 'Ajouter le cours'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export function TodaySchedule() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const todayIndex = (new Date().getDay() + 6) % 7
  const todayName = weekDays[todayIndex]

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await getCourses()
        const today = new Date()
        const todayStart = new Date(today)
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(todayStart)
        todayEnd.setHours(23, 59, 59, 999)

        // Filtrer uniquement les cours d’aujourd’hui
        const todayCourses = data.filter((course) => {
          const start = new Date(course.start)
          return start >= todayStart && start <= todayEnd
        })

        // Trier par heure de début
        todayCourses.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        )

        setCourses(todayCourses)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des cours du jour',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) return <div className="today-schedule">Chargement...</div>
  if (error)
    return <div className="today-schedule">Erreur : {error}</div>

  return (
    <div className="today-schedule">
      <h3>{todayName}</h3>

      {courses.length === 0 ? (
        <p>Aucun cours prévu aujourd’hui.</p>
      ) : (
        <ul className="today-course-list">
          {courses.map((course) => {
            const start = new Date(course.start)
            const end = new Date(course.end)
            const time = `${start.getHours().toString().padStart(2, '0')}:${start
              .getMinutes()
              .toString()
              .padStart(2, '0')} - ${end
              .getHours()
              .toString()
              .padStart(2, '0')}:${end
              .getMinutes()
              .toString()
              .padStart(2, '0')}`

            return (
              <li
                key={course.id}
                className={`today-course-item status-${course.status.toLowerCase()}`}
              >
                <div className="course-time">{time}</div>
                <div className="course-info">
                  <strong>{course.title}</strong>
                  
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

