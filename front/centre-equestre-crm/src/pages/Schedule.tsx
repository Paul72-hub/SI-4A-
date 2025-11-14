import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Schedule.scss"
import {
  createCourse,
  deleteCourse,
  getCourses,
  getHorses,
  updateCourse,
  type CourseResponse,
  type HorseResponse,
} from "../services/api"
import { useAuth } from "../context/AuthContext"

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
const hours = Array.from({ length: 12 }, (_, index) => `${(index + 8).toString().padStart(2, "0")}:00`)
const statusOptions: Array<{ value: CourseResponse["status"]; label: string }> = [
  { value: "PLANNED", label: "Prévu" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "CANCELLED", label: "Annulé" },
]

type SlotSelection = { dayIndex: number; hour: string }

type CourseFormState = {
  title: string
  description: string
  duration: number
  status: CourseResponse["status"]
  horseId?: number
}

const defaultFormState: CourseFormState = {
  title: "",
  description: "",
  duration: 60,
  status: "PLANNED",
  horseId: undefined,
}

type FormMode = "create" | "edit"

const buildSlotDate = (slot: SlotSelection, baseWeek: Date) => {
  const slotDate = new Date(baseWeek)
  slotDate.setDate(baseWeek.getDate() + slot.dayIndex)
  const hourValue = parseInt(slot.hour.split(":")[0] ?? "0", 10)
  slotDate.setHours(hourValue, 0, 0, 0)
  return slotDate
}

const overlaps = (startA: Date, endA: Date, startB: Date, endB: Date) => startA < endB && endA > startB

const formatRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso)
  const end = new Date(endIso)
  return `${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString(
    "fr-FR",
    { hour: "2-digit", minute: "2-digit" },
  )}`
}

const filterTodayCourses = (list: CourseResponse[]) => {
  const today = new Date()
  return list
    .filter((course) => {
      const courseDate = new Date(course.start)
      return courseDate.toDateString() === today.toDateString()
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

export function SchedulePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const weekStart = useMemo(() => {
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayOfWeek)
    monday.setHours(0, 0, 0, 0)
    return monday
  }, [])

  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [horses, setHorses] = useState<HorseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [horseError, setHorseError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formState, setFormState] = useState<CourseFormState>(defaultFormState)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setCourses([])
      return
    }
    refreshCourses()
  }, [user])

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const data = await getHorses()
        setHorses(data)
      } catch (err) {
        setHorseError(err instanceof Error ? err.message : "Impossible de charger les poneys")
      }
    }
    fetchHorses()
  }, [])

  const refreshCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!user) {
        setCourses([])
        return
      }
      const data = await getCourses(
        user.role === "CAVALIER"
          ? {
              role: user.role,
              userId: user.id,
            }
          : undefined,
      )
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de récupérer les cours")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <section className="schedule-page">
        <header>
          <h2>Agenda hebdomadaire</h2>
          <p>Connectez-vous pour visualiser vos séances et suivre la disponibilité des poneys.</p>
        </header>
        <div className="schedule-error">
          Vous devez être authentifié pour accéder à cette page.
          <button type="button" className="btn-primary" onClick={() => navigate("/connexion")}>
            Se connecter
          </button>
        </div>
      </section>
    )
  }

  const availableHorsesForSlot = (slot: SlotSelection, durationMinutes: number, excludeCourseId?: number) => {
    const slotStart = buildSlotDate(slot, weekStart)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)

    return horses.filter((horse) => {
      if (horse.status !== "AVAILABLE") return false
      const conflict = courses.some((course) => {
        if (!course.horse || course.horse.id !== horse.id) return false
        if (excludeCourseId && course.id === excludeCourseId) return false
        return overlaps(slotStart, slotEnd, new Date(course.start), new Date(course.end))
      })
      return !conflict
    })
  }

  const openFormForSlot = (slot: SlotSelection) => {
    setSelectedSlot(slot)
    setFormMode("create")
    setEditingCourse(null)
    const available = availableHorsesForSlot(slot, defaultFormState.duration)
    setFormState({
      ...defaultFormState,
      horseId: available[0]?.id,
    })
    setIsFormOpen(true)
    setFeedback(null)
  }

  const openFormForCourse = (course: CourseResponse) => {
    const courseDate = new Date(course.start)
    const hour = courseDate.getHours().toString().padStart(2, "0") + ":00"
    const normalized = new Date(courseDate)
    normalized.setHours(0, 0, 0, 0)
    const dayIndex = Math.round((normalized.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))

    const durationMinutes = Math.max(
      30,
      Math.round((new Date(course.end).getTime() - new Date(course.start).getTime()) / 60000),
    )

    setSelectedSlot({ dayIndex, hour })
    setFormMode("edit")
    setEditingCourse(course)
    setFormState({
      title: course.title,
      description: course.description ?? "",
      duration: durationMinutes,
      status: course.status,
      horseId: course.horse?.id,
    })
    setIsFormOpen(true)
    setFeedback(null)
  }

  const closeForm = () => {
    setSelectedSlot(null)
    setIsFormOpen(false)
    setFormState(defaultFormState)
    setEditingCourse(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({
      ...prev,
      [name]:
        name === "duration"
          ? Number(value)
          : name === "horseId"
            ? value
              ? Number(value)
              : undefined
            : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedSlot) return

    const startDate = buildSlotDate(selectedSlot, weekStart)
    const endDate = new Date(startDate.getTime() + formState.duration * 60000)

    try {
      setSubmitting(true)
      setFeedback(null)

      if (formState.horseId) {
        const stillAvailable = availableHorsesForSlot(selectedSlot, formState.duration, editingCourse?.id).some(
          (horse) => horse.id === formState.horseId,
        )
        if (!stillAvailable) {
          setFeedback("Ce poney est déjà occupé sur ce créneau.")
          return
        }
      }

      const payload = {
        title: formState.title,
        description: formState.description || undefined,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        status: formState.status,
        horseId: formState.horseId,
        riderId: user.role === "CAVALIER" ? user.id : undefined,
      }

      if (formMode === "edit" && editingCourse) {
        await updateCourse(editingCourse.id, payload)
      } else {
        await createCourse(payload)
      }
      await refreshCourses()
      closeForm()
      setFeedback(formMode === "edit" ? "Cours mis à jour" : "Cours ajouté")
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Impossible de créer le cours")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingCourse) return
    try {
      await deleteCourse(editingCourse.id)
      await refreshCourses()
      closeForm()
      setFeedback("Cours supprimé")
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Suppression impossible")
    }
  }

  const coursesForSlot = (slot: SlotSelection) =>
    courses.filter((course) => {
      const courseDate = new Date(course.start)
      const slotDate = buildSlotDate(slot, weekStart)
      return (
        courseDate.getFullYear() === slotDate.getFullYear() &&
        courseDate.getMonth() === slotDate.getMonth() &&
        courseDate.getDate() === slotDate.getDate() &&
        courseDate.getHours() === slotDate.getHours()
      )
    })

  const availableHorses = selectedSlot
    ? availableHorsesForSlot(selectedSlot, formState.duration, editingCourse?.id)
    : horses.filter((horse) => horse.status === "AVAILABLE")

  const todayCourses = useMemo(() => filterTodayCourses(courses), [courses])

  return (
    <section className="schedule-page">
      <header>
        <h2>Agenda hebdomadaire</h2>
        <p>Visualisation des créneaux horaires disponibles pour planifier les séances cheval/cavalier.</p>
      </header>

      {feedback && <div className="schedule-feedback">{feedback}</div>}
      {loading && <div className="schedule-loading">Chargement...</div>}
      {error && <div className="schedule-error">Erreur : {error}</div>}
      {horseError && <div className="schedule-error">Poneys : {horseError}</div>}

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
                const slot: SlotSelection = { dayIndex, hour }
                const slotCourses = coursesForSlot(slot)
                const slotLabel = `${day} ${hour}`
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="calendar-cell slot slot-trigger"
                    role="gridcell"
                    tabIndex={0}
                    aria-label={slotLabel}
                    onClick={() => openFormForSlot(slot)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        openFormForSlot(slot)
                      }
                    }}
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
                        {course.horse && <small> · {course.horse.name}</small>}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <TodaySchedule courses={todayCourses} />

      {isFormOpen && selectedSlot && (
        <div className="course-form-overlay" role="dialog" aria-modal="true">
          <form className="course-form" onSubmit={handleSubmit}>
            <h3>{formMode === "edit" ? "Modifier le cours" : "Ajouter un cours"}</h3>
            <p>
              Créneau sélectionné : {weekDays[selectedSlot.dayIndex]} à {selectedSlot.hour}
            </p>

            <label>
              Intitulé du cours
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                required
                placeholder="Cours Galop 3"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                placeholder="Objectifs, type de séance, niveau..."
              />
            </label>

            <label>
              Durée (minutes)
              <input
                type="number"
                name="duration"
                min={30}
                step={15}
                value={formState.duration}
                onChange={handleFormChange}
                required
              />
            </label>

            <label>
              Statut
              <select name="status" value={formState.status} onChange={handleFormChange}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Poney assigné
              <select name="horseId" value={formState.horseId ?? ""} onChange={handleFormChange}>
                <option value="">Sans poney</option>
                {availableHorses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} ({horse.status === "AVAILABLE" ? "libre" : "occupé"})
                  </option>
                ))}
              </select>
            </label>
            {!availableHorses.length && (
              <p className="schedule-warning">Aucun poney disponible sur ce créneau pour l’instant.</p>
            )}

            <div className="course-form-actions">
              {formMode === "edit" && (
                <button type="button" className="btn-danger" onClick={handleDelete} disabled={submitting}>
                  Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={submitting}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Enregistrement..." : formMode === "edit" ? "Mettre à jour" : "Créer le cours"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

type TodayScheduleProps = {
  courses?: CourseResponse[]
}

export function TodaySchedule({ courses }: TodayScheduleProps) {
  const [fallbackCourses, setFallbackCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courses !== undefined) return
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCourses()
        if (mounted) {
          setFallbackCourses(filterTodayCourses(data))
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Erreur lors du chargement des cours du jour")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [courses])

  if (courses === undefined) {
    if (loading) {
      return <div className="today-schedule">Chargement...</div>
    }
    if (error) {
      return <div className="today-schedule">Erreur : {error}</div>
    }
  }

  const list = courses ?? fallbackCourses

  if (!list.length) {
    return (
      <div className="today-schedule empty">
        <p>Aucun cours prévu aujourd’hui.</p>
      </div>
    )
  }

  return (
    <div className="today-schedule">
      <h3>Séances du jour</h3>
      <ul>
        {list.map((course) => (
          <li key={course.id}>
            <div>
              <strong>{course.title}</strong>
              <span>{formatRange(course.start, course.end)}</span>
            </div>
            <div className="today-schedule-meta">
              {course.horse ? <span>Poney : {course.horse.name}</span> : <span>Aucun poney assigné</span>}
              <span>Statut : {course.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
