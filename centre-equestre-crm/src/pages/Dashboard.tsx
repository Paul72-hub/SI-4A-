import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"


export function DashboardPage() {

  const Dispos = [
      { name: "Dispo", value: 40 },
      { name: "Occupés", value: 15 },
    ]

    const COLORS = ["#262a10", "#6f1d1b", "#FFBB28"]


  return (


    <section>
      <h2>Vue d&apos;ensemble</h2>
      <p>
        Cette zone accueillera les indicateurs principaux : planning du jour,
        disponibilite des chevaux, messages importants et nombre de chevaux dispo.
      </p>
      <div className="placeholder-grid">
        <article>
          <h3>Statut du jour</h3>
          
        </article>
        <article>
          <h3>Notifications</h3>
          <p>Alertes de sante, messages urgents et taches a suivre.</p>
        </article>
        <article>
          <h3>Suivi de l&apos;activite</h3>
          <PieChart width={250} height={250}>
            <Pie
              data={Dispos}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {Dispos.map((entry, index) => (
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
