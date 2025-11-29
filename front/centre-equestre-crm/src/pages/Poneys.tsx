import React, { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Cell, Tooltip, Legend } from "recharts"
import "../styles/Poneys.scss"
import {
  createHorse,
  deleteHorse,
  getHorses,
  updateHorse,
  type HorsePayload,
  type HorseResponse,
} from "../services/api"
import { useAuth } from "../context/AuthContext"

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#7B8D42",
  REST: "#F4A261",
  MAINTENANCE: "#8B5E3C",
}

type ChartSlice = { name: string; value: number }

const fallbackImage = "/images/petit-tonnerre.jpg"

const formatAge = (birthDate?: string | null) => {
  if (!birthDate) return "Âge inconnu"
  const birth = new Date(birthDate)
  const diff = new Date().getFullYear() - birth.getFullYear()
  return `${diff} an${diff > 1 ? "s" : ""}`
}

const formatHeight = (height?: number | null) => (height ? `${height} cm` : "N/A")
const formatWeight = (weight?: number | null) => (weight ? `${weight} kg` : "N/A")

const imageChoices = [
  "/images/petit-tonnerre.jpg",
  "/images/eclair.jpg",
  "/images/foudre.jpg",
  "/images/biscotte.jpg",
  "/images/mistral.jpg",
  "/images/caramel.jpg",
  "/images/jval.png",
]

const HorseCard: React.FC<{
  horse: HorseResponse
  canManage?: boolean
  onEdit?: (horse: HorseResponse) => void
  onDelete?: (horse: HorseResponse) => void
}> = ({ horse, canManage = false, onEdit, onDelete }) => {
  const statusLabel =
    horse.status === "AVAILABLE"
      ? "Disponible"
      : horse.status === "REST"
        ? "Repos / indisponible"
        : "Maintenance"

  const statusColor = STATUS_COLORS[horse.status] ?? "#8B5E3C"

  return (
    <div className="poney-card">
      <div className="poney-image">
        <img src={horse.imageUrl || fallbackImage} alt={horse.name} />
      </div>

      <div className="buttons">
        {canManage ? (
          <>
            <button className="edit-btn" onClick={() => onEdit?.(horse)}>
              Modifier
            </button>
            <button className="share-btn" onClick={() => onDelete?.(horse)}>
              Supprimer
            </button>
          </>
        ) : (
          <button className="share-btn">Partager</button>
        )}
      </div>

      <div className="poney-info">
        <h2>{horse.name}</h2>
        <p>{formatAge(horse.birthDate)}</p>
        <div className="poney-status" style={{ color: statusColor, fontWeight: "bold", marginTop: "5px" }}>
          {statusLabel}
        </div>
      </div>

      <hr />

      <div className="poney-details">
        <p>
          <strong>Sexe :</strong> {horse.sex}
        </p>
        <p>
          <strong>Race :</strong> {horse.breed ?? "Non renseigné"}
        </p>
        <p>
          <strong>Numéro SIRE :</strong> {horse.sireNumber ?? "Non renseigné"}
        </p>
        <p>
          <strong>Taille :</strong> {formatHeight(horse.heightCm)}
        </p>
        <p>
          <strong>Poids :</strong> {formatWeight(horse.weightKg)}
        </p>
        <p>
          <strong>Robe :</strong> {horse.coat ?? "Non renseigné"}
        </p>
        {horse.notes && (
          <p>
            <strong>Notes :</strong> {horse.notes}
          </p>
        )}
      </div>
    </div>
  )
}

export function PoneysPage() {
  const { user } = useAuth()
  const [horses, setHorses] = useState<HorseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [formState, setFormState] = useState<HorsePayload>({
    name: "Nouveau Poney",
    sex: "JUMENT",
    status: "AVAILABLE",
    breed: "",
    sireNumber: "",
    birthDate: undefined,
    heightCm: undefined,
    weightKg: undefined,
    coat: "",
    imageUrl: undefined,
    notes: "",
  })

  const fetchHorses = async () => {
    try {
      setLoading(true)
      const data = await getHorses()
      setHorses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les poneys")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHorses()
  }, [])

  const stats = useMemo<ChartSlice[]>(() => {
    if (horses.length === 0) return []
    const available = horses.filter((horse) => horse.status === "AVAILABLE").length
    const unavailable = horses.length - available
    return [
      { name: "Disponibles", value: available },
      { name: "Indisponibles", value: unavailable },
    ]
  }, [horses])

  const availableImages = useMemo(() => {
    const used = new Set(horses.map((horse) => horse.imageUrl).filter(Boolean) as string[])
    const current = formState.imageUrl
    return imageChoices.filter((image) => !used.has(image) || image === current)
  }, [horses, formState.imageUrl])

  useEffect(() => {
    if (!formState.imageUrl && availableImages.length > 0) {
      setFormState((prev) => ({ ...prev, imageUrl: availableImages[0] }))
    }
  }, [availableImages, formState.imageUrl])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSaving(true)
      if (editingId) {
        await updateHorse(editingId, formState)
      } else {
        await createHorse(formState)
      }
      setEditingId(null)
      setFormState({
        name: "Nouveau Poney",
        sex: "JUMENT",
        status: "AVAILABLE",
        breed: "",
        sireNumber: "",
        birthDate: undefined,
        heightCm: undefined,
        weightKg: undefined,
        coat: "",
        imageUrl: availableImages[0] ?? undefined,
        notes: "",
      })
      await fetchHorses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer le poney")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="poneys-page">
      <h1>Fiches des poneys</h1>
      {error && <p className="error-banner">{error}</p>}

      <div className="poney-layout">
        <div className="poney-chart">
          <h3>Occupation des poneys</h3>
          {stats.length === 0 ? (
            <p>Aucune donnée disponible.</p>
          ) : (
            <PieChart width={250} height={250}>
              <Pie data={stats} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label>
                {stats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#7B8D42" : "#8B5E3C"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>

        {user?.role === "DIRECTEUR" && (
          <form className="horse-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Modifier un poney" : "Ajouter un poney"}</h3>
            <div className="form-grid">
              <label>
                Nom
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                Sexe
                <select value={formState.sex} onChange={(event) => setFormState((prev) => ({ ...prev, sex: event.target.value }))}>
                  <option value="JUMENT">Jument</option>
                  <option value="HONGRE">Hongre</option>
                  <option value="ETALON">Étalon</option>
                </select>
              </label>
              <label>
                Statut
                <select
                  value={formState.status}
                  onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="REST">Repos</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </label>
              <label>
                Race
                <input
                  type="text"
                  value={formState.breed ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, breed: event.target.value }))}
                />
              </label>
              <label>
                Numéro SIRE
                <input
                  type="text"
                  value={formState.sireNumber ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, sireNumber: event.target.value }))}
                />
              </label>
              <label>
                Date de naissance
                <input
                  type="date"
                  value={formState.birthDate ? formState.birthDate.slice(0, 10) : ""}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, birthDate: event.target.value || undefined }))
                  }
                />
              </label>
              <label>
                Taille (cm)
                <input
                  type="number"
                  value={formState.heightCm ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      heightCm: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </label>
              <label>
                Poids (kg)
                <input
                  type="number"
                  value={formState.weightKg ?? ""}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      weightKg: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </label>
              <label>
                Robe
                <input
                  type="text"
                  value={formState.coat ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, coat: event.target.value }))}
                />
              </label>
              <label>
                Image
                <select
                  value={formState.imageUrl ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
                >
                  <option value="">(Aucune)</option>
                  {availableImages.map((image) => (
                    <option key={image} value={image}>
                      {image.replace("/images/", "")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="notes-field">
                Notes
                <textarea
                  value={formState.notes ?? ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                />
              </label>
            </div>
            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(null)
                    setFormState({
                      name: "Nouveau Poney",
                      sex: "JUMENT",
                      status: "AVAILABLE",
                      breed: "",
                      sireNumber: "",
                      birthDate: undefined,
                      heightCm: undefined,
                      weightKg: undefined,
                      coat: "",
                      imageUrl: availableImages[0] ?? undefined,
                      notes: "",
                    })
                  }}
                  disabled={saving}
                >
                  Annuler
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </form>
        )}

        <div className="poney-grid">
          {loading ? (
            <p>Chargement...</p>
          ) : horses.length === 0 ? (
            <p>Aucun poney enregistré pour le moment.</p>
          ) : (
            horses.map((horse) => (
              <HorseCard
                key={horse.id}
                horse={horse}
                canManage={user?.role === "DIRECTEUR"}
                onEdit={(target) => {
                  setEditingId(target.id)
                  setFormState({
                    name: target.name,
                    sex: target.sex,
                    status: target.status,
                    breed: target.breed ?? "",
                    sireNumber: target.sireNumber ?? "",
                    birthDate: target.birthDate ?? undefined,
                    heightCm: target.heightCm ?? undefined,
                    weightKg: target.weightKg ?? undefined,
                    coat: target.coat ?? "",
                    imageUrl: target.imageUrl ?? undefined,
                    notes: target.notes ?? "",
                  })
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                onDelete={async (target) => {
                  if (window.confirm(`Supprimer ${target.name} ?`)) {
                    await deleteHorse(target.id)
                    await fetchHorses()
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
