import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Watermark } from "../../components/Watermark"
import { FeaturedPartnerBanner } from "../../components/FeaturedPartnerBanner"

const PLACEHOLDER_BALANCE = "128,50 €"

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
  return (
    <Watermark text="SIMULATION SOLDE ET HISTORIQUE">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <h1 className="text-2xl font-semibold">Mon solde</h1>

        <FeaturedPartnerBanner />

        <Card>
          <CardHeader>
            <CardDescription>Solde disponible</CardDescription>
            <CardTitle className="text-4xl">{PLACEHOLDER_BALANCE}</CardTitle>
          </CardHeader>
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
