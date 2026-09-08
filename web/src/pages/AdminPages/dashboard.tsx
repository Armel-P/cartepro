import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Watermark } from "../../components/Watermark"
import { api } from "../../api"

type UserSummaryApi = {
  id: string
  name: string
  mail: string
  role: "Admin" | "Partner" | "Manant"
  state: string | null
  created_at: number
}

type TransactionRow = {
  success: boolean
  value: number
}

function formatAmount(value: number): string {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

async function fetchTransactionsCsv(): Promise<TransactionRow[]> {
  const response = await fetch("/api/v1/admin/transactions.csv")
  if (!response.ok) throw new Error(`CSV request failed: ${response.status}`)
  const text = await response.text()
  const lines = text.trim().split("\n")
  const header = lines[0]?.split(",") ?? []
  const successIndex = header.indexOf("success")
  const valueIndex = header.indexOf("value")
  if (successIndex === -1 || valueIndex === -1) return []

  return lines.slice(1).map((line) => {
    const cols = line.split(",")
    return {
      success: cols[successIndex] === "true",
      value: Number(cols[valueIndex]) || 0,
    }
  })
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserSummaryApi[]>([])
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      api<UserSummaryApi[]>("/admin/users"),
      fetchTransactionsCsv(),
    ])
      .then(([usersData, txData]) => {
        if (cancelled) return
        setUsers(usersData)
        setTransactions(txData)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer les données du tableau de bord.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const employees = users.filter((u) => u.role === "Manant")
    const partners = users.filter((u) => u.role === "Partner")
    const admins = users.filter((u) => u.role === "Admin")
    const activePartners = partners.filter((p) => p.state === "active")
    const pendingPartners = partners.filter(
      (p) => p.state === "waiting_activation",
    )
    const suspended = users.filter((u) => u.state === "suspended")

    const successful = transactions.filter((t) => t.success)
    const totalVolume = successful.reduce((sum, t) => sum + t.value, 0)

    return {
      employeesCount: employees.length,
      partnersCount: partners.length,
      adminsCount: admins.length,
      activePartnersCount: activePartners.length,
      pendingPartnersCount: pendingPartners.length,
      suspendedCount: suspended.length,
      transactionsCount: transactions.length,
      successfulCount: successful.length,
      totalVolume,
    }
  }, [users, transactions])

  return (
    <Watermark text="TABLEAU DE BORD PARTIEL — RÉPARTITION GÉO NON DISPONIBLE">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 md:p-10">
        <h1 className="text-2xl font-semibold">Tableau de bord national</h1>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Volume total de transactions</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "…" : formatAmount(stats.totalVolume)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Transactions validées</CardDescription>
              <CardTitle className="text-3xl">
                {loading
                  ? "…"
                  : `${stats.successfulCount} / ${stats.transactionsCount}`}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Partenaires actifs</CardDescription>
              <CardTitle className="text-3xl">
                {loading
                  ? "…"
                  : `${stats.activePartnersCount} / ${stats.partnersCount}`}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des comptes</CardTitle>
            <CardDescription>Par rôle et par état</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <dt className="text-muted-foreground">Salariés</dt>
              <dd className="col-span-1 font-medium sm:col-span-2">
                {loading ? "…" : stats.employeesCount}
              </dd>
              <dt className="text-muted-foreground">Partenaires</dt>
              <dd className="col-span-1 font-medium sm:col-span-2">
                {loading ? "…" : stats.partnersCount}
              </dd>
              <dt className="text-muted-foreground">Administrateurs</dt>
              <dd className="col-span-1 font-medium sm:col-span-2">
                {loading ? "…" : stats.adminsCount}
              </dd>
              <dt className="text-muted-foreground">
                Partenaires en attente
              </dt>
              <dd className="col-span-1 font-medium sm:col-span-2">
                {loading ? "…" : stats.pendingPartnersCount}
              </dd>
              <dt className="text-muted-foreground">Comptes suspendus</dt>
              <dd className="col-span-1 font-medium sm:col-span-2">
                {loading ? "…" : stats.suspendedCount}
              </dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition géographique</CardTitle>
            <CardDescription>
              Non disponible — les coordonnées des partenaires ne sont
              exposées par aucune route de l'API actuellement.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </Watermark>
  )
}
