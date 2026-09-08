import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Separator } from "../../components/ui/separator"
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

type Employee = {
  id: string
  name: string
  mail: string
}

type EmployeeApi = {
  id: string
  balance: number | null
}

type CreditLog = {
  id: string
  name: string
  amount: number
  newBalance: number
  at: string
}

function formatAmount(value: number): string {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function nowLabel(): string {
  return new Date().toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminEnterprisePaymentPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [actingId, setActingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [logs, setLogs] = useState<CreditLog[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<UserSummaryApi[]>("/admin/users")
      .then((data) => {
        if (cancelled) return
        setEmployees(
          data
            .filter((u) => u.role === "Manant")
            .map((u) => ({ id: u.id, name: u.name, mail: u.mail })),
        )
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer la liste des salariés.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) || e.mail.toLowerCase().includes(q),
    )
  }, [employees, query])

  const sortedLogs = useMemo(() => [...logs].reverse(), [logs])

  async function credit(employee: Employee) {
    const raw = amounts[employee.id] ?? ""
    const amount = Number(raw.replace(",", "."))
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError("Montant invalide.")
      return
    }

    setActionError(null)
    setActingId(employee.id)
    try {
      const current = await api<EmployeeApi>(`/employees/${employee.id}`)
      const newBalance = (current.balance ?? 0) + amount
      await api(`/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance }),
      })
      setLogs((list) => [
        ...list,
        {
          id: employee.id,
          name: employee.name,
          amount,
          newBalance,
          at: nowLabel(),
        },
      ])
      setAmounts((a) => ({ ...a, [employee.id]: "" }))
    } catch {
      setActionError(`Impossible de créditer "${employee.name}".`)
    } finally {
      setActingId(null)
    }
  }

  return (
    <Watermark text="ABONDEMENTS — CRÉDIT MANUEL">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">Abondements employeurs</h1>
          <p className="text-sm text-muted-foreground">
            Créditez le solde d'un salarié. À refaire chaque mois pour un
            abondement récurrent.
          </p>
        </div>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {actionError && (
          <p className="text-sm text-destructive">{actionError}</p>
        )}

        <Input
          placeholder="Rechercher un salarié par nom ou e-mail…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Card>
          <CardHeader>
            <CardTitle>Salariés</CardTitle>
            <CardDescription>
              {loading
                ? "Chargement…"
                : `${filtered.length} salarié${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""}.`}
            </CardDescription>
          </CardHeader>
          {!loading && filtered.length > 0 && (
            <CardContent>
              <ul className="flex flex-col">
                {filtered.map((employee, index) => (
                  <li key={employee.id}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {employee.mail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          inputMode="decimal"
                          placeholder="0,00"
                          className="w-28"
                          value={amounts[employee.id] ?? ""}
                          onChange={(e) =>
                            setAmounts((a) => ({
                              ...a,
                              [employee.id]: e.target.value,
                            }))
                          }
                          disabled={actingId === employee.id}
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={actingId === employee.id}
                          onClick={() => credit(employee)}
                        >
                          {actingId === employee.id ? "…" : "Créditer"}
                        </Button>
                      </div>
                    </div>
                    {index < filtered.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>

        {sortedLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Abondements récents</CardTitle>
              <CardDescription>
                Effectués pendant cette session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {sortedLogs.map((log, index) => (
                  <li key={`${log.id}-${log.at}`}>
                    <div className="flex flex-col gap-1 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">{log.name}</span>
                        <span className="text-sm font-medium text-positive">
                          +{formatAmount(log.amount)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {log.at} · nouveau solde {formatAmount(log.newBalance)}
                      </span>
                    </div>
                    {index < sortedLogs.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </Watermark>
  )
}
