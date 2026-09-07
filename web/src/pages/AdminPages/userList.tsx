import { useMemo, useState } from "react"
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

const PLACEHOLDER_USERS: UserAccount[] = [
  {
    id: "1",
    name: "Jean-Eudes Berlier",
    mail: "j.berlier@cartepro-demo.fr",
    role: "admin",
    state: "active",
    createdAt: "12 janvier 2026",
  },
  {
    id: "2",
    name: "Thomas Vignal",
    mail: "t.vignal@cartepro-demo.fr",
    role: "admin",
    state: "active",
    createdAt: "12 janvier 2026",
  },
  {
    id: "3",
    name: "Poney Dream 78",
    mail: "contact@poneydream78.fr",
    role: "partner",
    state: "active",
    createdAt: "15 août 2026",
  },
  {
    id: "4",
    name: "KostumParty",
    mail: "boutique@kostumparty.fr",
    role: "partner",
    state: "active",
    createdAt: "18 août 2026",
  },
  {
    id: "5",
    name: "Glaces Artisanales Corrèze",
    mail: "commande@glaces-correze.fr",
    role: "partner",
    state: "waiting_activation",
    createdAt: "2 septembre 2026",
  },
  {
    id: "6",
    name: "Chapelier Fontaine",
    mail: "contact@chapelier-fontaine.fr",
    role: "partner",
    state: "active",
    createdAt: "20 août 2026",
  },
  {
    id: "7",
    name: "Claire Dubosc",
    mail: "claire.dubosc@example.fr",
    role: "employee",
    state: "active",
    createdAt: "3 septembre 2026",
  },
  {
    id: "8",
    name: "Nadia Ferrand",
    mail: "nadia.ferrand@example.fr",
    role: "employee",
    state: "active",
    createdAt: "3 septembre 2026",
  },
  {
    id: "9",
    name: "Mehdi Larbi",
    mail: "mehdi.larbi@example.fr",
    role: "employee",
    state: "suspended",
    createdAt: "28 août 2026",
  },
]

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
  const [users, setUsers] = useState<UserAccount[]>(PLACEHOLDER_USERS)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")

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
    <Watermark text="SIMULATION GESTION DES COMPTES">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des comptes</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} comptes au total — {activeCount} actifs,{" "}
            {suspendedCount} suspendu{suspendedCount > 1 ? "s" : ""}.
          </p>
        </div>

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
