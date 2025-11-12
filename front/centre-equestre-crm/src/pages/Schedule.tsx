import React from "react"
import "../styles/Schedule.scss"

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

export function SchedulePage() {
  return (
    <section className="schedule-page">
      <header>
        <h2>Agenda hebdomadaire</h2>
        <p>
          Visualisation des creneaux horaires disponibles pour planifier les
          seances cheval et cavalier.
        </p>
      </header>

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-color disponible" />
          Disponible
        </span>
        <span className="legend-item">
          <span className="legend-color reserve" />
          Reserve
        </span>
        <span className="legend-item">
          <span className="legend-color maintenance" />
          Maintenance
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
              {weekDays.map((day) => (
                <div
                  key={`${day}-${hour}`}
                  className="calendar-cell slot disponible"
                  role="gridcell"
                  aria-label={`${day} ${hour}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TodaySchedule() {
  const todayIndex = (new Date().getDay() + 6) % 7
  const today = weekDays[todayIndex]

  return (
    <div className="today-schedule">
      <h3>{today}</h3>
      <div className="today-column">
        {hours.map((hour) => (
          <div key={hour} className="hour-slot disponible">
            <span className="hour-label">{hour}</span>
          </div>
        ))}
      </div>
    </div>
  )
}