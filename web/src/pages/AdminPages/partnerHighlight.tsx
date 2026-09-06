import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { Watermark } from "../../components/Watermark"
import { PARTNERS } from "../../data/partners"
import {
  clearFeatured,
  featurePartner,
  getAllClicks,
  getCurrentFeatured,
  getFeaturedHistory,
  type FeaturedEntry,
} from "../../lib/featured"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AdminPartnerHighlightPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const current = useMemo<FeaturedEntry | null>(
    () => getCurrentFeatured(),
    [refreshKey],
  )
  const history = useMemo<FeaturedEntry[]>(
    () => [...getFeaturedHistory()].reverse(),
    [refreshKey],
  )
  const clicks = useMemo(
    () => getAllClicks(),
    [refreshKey],
  )

  function refresh() {
    setRefreshKey((n) => n + 1)
  }

  function highlight(partnerId: string) {
    featurePartner(partnerId)
    refresh()
  }

  function remove() {
    clearFeatured()
    refresh()
  }

  const past = history.filter((entry) => entry.endedAt !== null)

  return (
    <Watermark text="SIMULATION COUP DE CŒUR">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">Coup de cœur partenaire</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez le partenaire mis en avant en haut de la page d'accueil
            des salariés.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actuellement en avant</CardTitle>
            <CardDescription>
              {current
                ? `Depuis le ${formatDate(current.startedAt)}`
                : "Aucun partenaire mis en avant pour le moment."}
            </CardDescription>
          </CardHeader>
          {current && (
            <CardContent>
              {(() => {
                const partner = PARTNERS.find((p) => p.id === current.partnerId)
                return (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {partner?.name ?? current.partnerId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clicks[current.partnerId] ?? 0} clic
                        {(clicks[current.partnerId] ?? 0) > 1 ? "s" : ""} au total
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={remove}>
                      Retirer
                    </Button>
                  </div>
                )
              })()}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tous les partenaires</CardTitle>
            <CardDescription>
              Le nombre de clics est cumulé sur tous les passages en coup de
              cœur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {PARTNERS.map((partner, index) => {
                const isCurrent = current?.partnerId === partner.id
                return (
                  <li key={partner.id}>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{partner.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {partner.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {clicks[partner.id] ?? 0} clic
                          {(clicks[partner.id] ?? 0) > 1 ? "s" : ""}
                        </span>
                        <Button
                          type="button"
                          variant={isCurrent ? "secondary" : "outline"}
                          disabled={isCurrent}
                          onClick={() => highlight(partner.id)}
                        >
                          {isCurrent ? "En avant" : "Mettre en avant"}
                        </Button>
                      </div>
                    </div>
                    {index < PARTNERS.length - 1 && <Separator />}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
            <CardDescription>
              Remettez en avant un coup de cœur précédent en un clic, sans
              rien ressaisir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucun historique pour le moment.
              </p>
            ) : (
              <ul className="flex flex-col">
                {past.map((entry, index) => {
                  const partner = PARTNERS.find((p) => p.id === entry.partnerId)
                  return (
                    <li key={entry.id}>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {partner?.name ?? entry.partnerId}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Du {formatDate(entry.startedAt)} au{" "}
                            {entry.endedAt ? formatDate(entry.endedAt) : "—"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => highlight(entry.partnerId)}
                        >
                          Remettre en avant
                        </Button>
                      </div>
                      {index < past.length - 1 && <Separator />}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </Watermark>
  )
}
