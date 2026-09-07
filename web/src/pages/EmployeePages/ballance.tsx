import { useEffect, useState } from "react"
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

type Employee = {
  id: string
  balance: number | null
}

function formatBalance(value: number): string {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

const POSITIVE_BALANCE_MESSAGES: ((amount: string) => string)[] = [
  (amount) => `${amount} à dépenser chez vos partenaires préférés !`,
  (amount) => `${amount} rien que pour vous faire plaisir.`,
  (amount) => `${amount} disponibles pour profiter de la vie.`,
  (amount) => `${amount} prêts à être croqués chez nos partenaires.`,
  (amount) => `${amount} pour vous chouchouter aujourd'hui.`,
  (amount) => `${amount}, de quoi se faire plaisir sans culpabiliser.`,
  (amount) => `${amount} qui n'attendent qu'à être dépensés !`,
  (amount) => `${amount} de bonheur en réserve.`,
  (amount) => `${amount} pour une pause bien méritée.`,
  (amount) => `${amount} à croquer partout où vous voulez.`,
]

function pickRandomMessage(amount: string): string {
  const template =
    POSITIVE_BALANCE_MESSAGES[
      Math.floor(Math.random() * POSITIVE_BALANCE_MESSAGES.length)
    ]
  return template(amount)
}

type Transaction = {
  id: string
  label: string
  date: string
  amount: string
  direction: "debit" | "credit"
}

const PLACEHOLDER_TRANSACTIONS: Transaction[] = [
  { id: "1", label: "Déjeuner — Le Bistrot", date: "31 août 2026", amount: "-12,50 €", direction: "debit" },
  { id: "2", label: "Rechargement du compte", date: "28 août 2026", amount: "+50,00 €", direction: "credit" },
  { id: "3", label: "Déjeuner — Sushi Corner", date: "27 août 2026", amount: "-15,90 €", direction: "debit" },
  { id: "4", label: "Déjeuner — Boulangerie Martin", date: "26 août 2026", amount: "-6,40 €", direction: "debit" },
  { id: "5", label: "Rechargement du compte", date: "21 août 2026", amount: "+50,00 €", direction: "credit" },
]

export default function BalancePage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      setError("Vous devez être connecté pour consulter votre solde.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    api<Employee>(`/employees/${user.id}`)
      .then((employee) => {
        if (cancelled) return
        setBalance(employee.balance ?? null)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer votre solde pour le moment.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (balance !== null) {
      setMessage(pickRandomMessage(formatBalance(balance)))
    }
  }, [balance])

  return (
    <Watermark text="SOLDE RÉEL — HISTORIQUE SIMULÉ">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <h1 className="text-2xl font-semibold">Mon solde</h1>

        <Card>
          <CardHeader>
            <CardDescription>Solde disponible</CardDescription>
            <CardTitle className="text-4xl">
              {loading
                ? "…"
                : balance !== null
                  ? formatBalance(balance)
                  : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              !loading &&
              message && (
                <p className="text-sm font-medium text-brand-accent">
                  {message}
                </p>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des transactions</CardTitle>
            <CardDescription>Vos derniers mouvements de compte</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {PLACEHOLDER_TRANSACTIONS.map((transaction, index) => (
                <li key={transaction.id}>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {transaction.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.date}
                      </span>
                    </div>
                    <span
                      className={
                        transaction.direction === "credit"
                          ? "font-medium text-positive"
                          : "font-medium text-negative"
                      }
                    >
                      {transaction.amount}
                    </span>
                  </div>
                  {index < PLACEHOLDER_TRANSACTIONS.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </Watermark>
  )
}
