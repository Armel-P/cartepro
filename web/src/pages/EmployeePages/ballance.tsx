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

type ApiTransaction = {
  id: string
  timestamp: number
  success: boolean
  value: number
  partner_id: string
  employee_id: string
}

type Transaction = {
  id: string
  label: string
  date: string
  amount: string
  direction: "debit" | "credit"
}

function formatBalance(value: number): string {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  })
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

export default function BalancePage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
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

    Promise.all([
      api<Employee>(`/employees/${user.id}`),
      api<ApiTransaction[]>(`/employees/${user.id}/transactions`),
    ])
      .then(([employee, apiTransactions]) => {
        if (cancelled) return

        setBalance(employee.balance ?? null)

        const formattedTransactions: Transaction[] = apiTransactions
          .filter((transaction) => transaction.success)
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((transaction) => ({
            id: transaction.id,
            label: "Paiement chez un partenaire",
            date: formatDate(transaction.timestamp),
            amount: `-${formatBalance(transaction.value)}`,
            direction: "debit",
          }))

        setTransactions(formattedTransactions)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return

        setError("Impossible de récupérer vos données pour le moment.")
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
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
    <Watermark text="SOLDE RÉEL — HISTORIQUE RÉEL">
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
              <p className="text-sm text-destructive">
                {error}
              </p>
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

            <CardDescription>
              Vos derniers mouvements de compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chargement de vos transactions…
              </p>
            ) : transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune transaction pour le moment.
              </p>
            ) : (
              <ul className="flex max-h-100 flex-col gap-2 overflow-y-auto scroll-auto scrollbar-none">
                {transactions.map((transaction, index) => (
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

                    {index < transactions.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </Watermark>
  )
}
