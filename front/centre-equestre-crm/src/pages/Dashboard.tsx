import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { TodaySchedule } from "./Schedule"
import { HomeMessages } from "./HomeMessages"

const COLORS = ["#262a10", "#6f1d1b", "#ffbb28"]
const availability = [
  { name: "Dispo", value: 40 },
  { name: "Occupés", value: 15 },
]

export function DashboardPage() {
  return (
    <section className="dashboard-overview">
      <div className="dashboard-hero">
        <h2>Vue d&apos;ensemble</h2>
        <p>
          Bienvenue sur votre tableau de bord ! Retrouvez ici un aperçu rapide du planning, des messages clés et de
          l’activité de l’écurie.
        </p>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Planning du jour</h3>
          <TodaySchedule />
        </article>

        <article className="dashboard-card">
          <h3>Messages récents</h3>
          <HomeMessages />
        </article>

        <article className="dashboard-card dashboard-chart">
          <h3>Suivi de l&apos;activité</h3>
          <PieChart width={250} height={220}>
            <Pie data={availability} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {availability.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </article>
      </div>
    </section>
  )
}
