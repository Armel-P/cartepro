import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button, buttonVariants } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Separator } from "../../components/ui/separator"
import { Watermark } from "../../components/Watermark"
import { api } from "../../api"

type Role = "admin" | "partner" | "employee"
type AccountState = "active" | "suspended" | "waiting_activation"

type UserAccount = {
  id: string
  name: string
  mail: string
  role: Role
  state: AccountState
  createdAt: string
}

type UserSummaryApi = {
  id: string
  name: string
  mail: string
  role: "Admin" | "Partner" | "Manant"
  state: string | null
  created_at: number
}

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  partner: "Partenaire",
  employee: "Salarié",
}

const ROLE_FILTERS: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "employee", label: "Salariés" },
  { value: "partner", label: "Partenaires" },
  { value: "admin", label: "Admins" },
]

const API_ROLE_TO_ROLE: Record<UserSummaryApi["role"], Role> = {
  Admin: "admin",
  Partner: "partner",
  Manant: "employee",
}

const ACCOUNT_STATES: AccountState[] = ["active", "suspended", "waiting_activation"]

function toAccountState(state: string | null): AccountState {
  return ACCOUNT_STATES.includes(state as AccountState)
    ? (state as AccountState)
    : "active"
}

function formatDate(value: number): string {
  return new Date(value * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function StateBadge({ state }: { state: AccountState }) {
  const styles: Record<AccountState, string> = {
    active: "bg-positive/10 text-positive",
    suspended: "bg-destructive/10 text-destructive",
    waiting_activation: "bg-brand-accent/10 text-brand-accent",
  }
  const labels: Record<AccountState, string> = {
    active: "Actif",
    suspended: "Suspendu",
    waiting_activation: "En attente d'activation",
  }
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[state]}`}
    >
      {labels[state]}
    </span>
  )
}

export default function AdminUserListPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<UserSummaryApi[]>("/admin/users")
      .then((data) => {
        if (cancelled) return
        setUsers(
          data.map((u) => ({
            id: u.id,
            name: u.name,
            mail: u.mail,
            role: API_ROLE_TO_ROLE[u.role],
            state: toAccountState(u.state),
            createdAt: formatDate(u.created_at),
          })),
        )
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer la liste des comptes.")
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
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.mail.toLowerCase().includes(q)
      return matchesRole && matchesQuery
    })
  }, [users, query, roleFilter])

  const activeCount = users.filter((u) => u.state === "active").length
  const suspendedCount = users.filter((u) => u.state === "suspended").length

  function toggleSuspended(id: string) {
    setUsers((list) =>
      list.map((user) =>
        user.id === id
          ? {
              ...user,
              state: user.state === "suspended" ? "active" : "suspended",
            }
          : user,
      ),
    )
  }

  return (
    <Watermark text="COMPTES RÉELS — SUSPENSION NON PERSISTÉE">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des comptes</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Chargement…"
              : `${users.length} comptes au total — ${activeCount} actifs, ${suspendedCount} suspendu${suspendedCount > 1 ? "s" : ""}.`}
          </p>
        </div>

        {error && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Rechercher par nom ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={roleFilter === filter.value ? "secondary" : "outline"}
                onClick={() => setRoleFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comptes</CardTitle>
            <CardDescription>
              {filtered.length === 0
                ? "Aucun compte ne correspond à cette recherche."
                : `${filtered.length} compte${filtered.length > 1 ? "s" : ""} affiché${filtered.length > 1 ? "s" : ""}.`}
            </CardDescription>
          </CardHeader>
          {filtered.length > 0 && (
            <CardContent>
              <ul className="flex flex-col">
                {filtered.map((user, index) => (
                  <li key={user.id}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <StateBadge state={user.state} />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {user.mail}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ROLE_LABELS[user.role]} · inscrit le{" "}
                          {user.createdAt}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {user.state === "waiting_activation" ? (
                          <Link
                            to="/AdminPages/partnerValidation"
                            className={buttonVariants({ size: "sm" })}
                          >
                            Voir la demande
                          </Link>
                        ) : (
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            {user.state === "active" ? "Actif" : "Suspendu"}
                            <Switch
                              checked={user.state === "active"}
                              onCheckedChange={() => toggleSuspended(user.id)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    {index < filtered.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </main>
    </Watermark>
  )
}
