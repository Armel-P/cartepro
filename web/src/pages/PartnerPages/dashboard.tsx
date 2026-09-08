import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Watermark } from "../../components/Watermark"
import { api } from "../../api"
import { getUser } from "../../auth"

type TransactionApi = {
  id: string
  timestamp: number
  success: boolean
  value: number
  partner_id: string
  employee_id: string
}

function formatAmount(value: number): string {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function formatDate(value: number): string {
  return new Date(value * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function dayKey(value: number): string {
  return new Date(value * 1000).toISOString().slice(0, 10)
}

export default function PartnerDashboardPage() {
  const [transactions, setTransactions] = useState<TransactionApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      setError("Vous devez être connecté pour consulter votre tableau de bord.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    api<TransactionApi[]>(`/partners/${user.id}/transactions`)
      .then((data) => {
        if (cancelled) return
        setTransactions(data)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer vos transactions.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const successful = useMemo(
    () => transactions.filter((t) => t.success),
    [transactions],
  )

  const totalReceived = useMemo(
    () => successful.reduce((sum, t) => sum + t.value, 0),
    [successful],
  )

  const byDay = useMemo(() => {
    const groups = new Map<string, { date: number; total: number; count: number }>()
    for (const t of successful) {
      const key = dayKey(t.timestamp)
      const existing = groups.get(key)
      if (existing) {
        existing.total += t.value
        existing.count += 1
      } else {
        groups.set(key, { date: t.timestamp, total: t.value, count: 1 })
      }
    }
    return [...groups.values()].sort((a, b) => b.date - a.date)
  }, [successful])

  return (
    <Watermark text="TABLEAU DE BORD RÉEL">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <h1 className="text-2xl font-semibold">Tableau de bord financier</h1>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Montant total reçu</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "…" : formatAmount(totalReceived)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Transactions validées</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "…" : successful.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transactions par jour</CardTitle>
            <CardDescription>
              Regroupement des encaissements validés
            </CardDescription>
          </CardHeader>
          {!loading && byDay.length > 0 && (
            <CardContent>
              <ul className="flex flex-col">
                {byDay.map((day, index) => (
                  <li key={dayKey(day.date)}>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {formatDate(day.date)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {day.count} transaction{day.count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="font-medium text-positive">
                        {formatAmount(day.total)}
                      </span>
                    </div>
                    {index < byDay.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
          {!loading && byDay.length === 0 && !error && (
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucune transaction pour le moment.
            </CardContent>
          )}
        </Card>
      </main>
    </Watermark>
  )
}
