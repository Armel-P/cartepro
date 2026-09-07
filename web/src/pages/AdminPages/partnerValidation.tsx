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

type PendingPartner = {
  id: string
  company: string
  siren: string
  socialObject: string
  mail: string
  requestedAt: string
}

type Decision = {
  id: string
  company: string
  decision: "approved" | "rejected"
  comment?: string
  at: string
}

const PLACEHOLDER_PENDING: PendingPartner[] = [
  {
    id: "1",
    company: "Boulangerie Martin",
    siren: "552100554",
    socialObject: "Boulangerie-pâtisserie artisanale",
    mail: "contact@boulangerie-martin.fr",
    requestedAt: "2 septembre 2026",
  },
  {
    id: "2",
    company: "Sushi Corner SARL",
    siren: "843201967",
    socialObject: "Restauration japonaise sur place et à emporter",
    mail: "gerant@sushicorner.fr",
    requestedAt: "3 septembre 2026",
  },
  {
    id: "3",
    company: "Presse du Centre",
    siren: "409824512",
    socialObject: "Vente de presse, papeterie et articles de bureau",
    mail: "presse.ducentre@orange.fr",
    requestedAt: "3 septembre 2026",
  },
]

function nowLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AdminPartnerValidationPage() {
  const [pending, setPending] = useState<PendingPartner[]>(PLACEHOLDER_PENDING)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [commentError, setCommentError] = useState(false)

  const sortedDecisions = useMemo(
    () => [...decisions].reverse(),
    [decisions],
  )

  function resetRejection() {
    setRejectingId(null)
    setComment("")
    setCommentError(false)
  }

  function approve(partner: PendingPartner) {
    setPending((list) => list.filter((p) => p.id !== partner.id))
    setDecisions((list) => [
      ...list,
      {
        id: partner.id,
        company: partner.company,
        decision: "approved",
        at: nowLabel(),
      },
    ])
    if (rejectingId === partner.id) resetRejection()
  }

  function confirmRejection(partner: PendingPartner) {
    if (!comment.trim()) {
      setCommentError(true)
      return
    }
    setPending((list) => list.filter((p) => p.id !== partner.id))
    setDecisions((list) => [
      ...list,
      {
        id: partner.id,
        company: partner.company,
        decision: "rejected",
        comment: comment.trim(),
        at: nowLabel(),
      },
    ])
    resetRejection()
  }

  return (
    <Watermark text="SIMULATION VALIDATION PARTENAIRES">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">
            Validation des demandes partenaires
          </h1>
          <p className="text-sm text-muted-foreground">
            {pending.length === 0
              ? "Aucune demande en attente."
              : `${pending.length} demande${
                  pending.length > 1 ? "s" : ""
                } en attente de validation.`}
          </p>
        </div>

        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Toutes les demandes ont été traitées.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((partner) => {
              const isRejecting = rejectingId === partner.id
              return (
                <Card key={partner.id}>
                  <CardHeader>
                    <CardTitle>{partner.company}</CardTitle>
                    <CardDescription>
                      Demande reçue le {partner.requestedAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                      <dt className="text-muted-foreground">SIREN</dt>
                      <dd className="font-medium">{partner.siren}</dd>
                      <dt className="text-muted-foreground">Objet social</dt>
                      <dd className="font-medium">{partner.socialObject}</dd>
                      <dt className="text-muted-foreground">E-mail</dt>
                      <dd className="font-medium break-all">{partner.mail}</dd>
                    </dl>

                    {isRejecting ? (
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor={`comment-${partner.id}`}
                          className="text-sm font-medium"
                        >
                          Motif du refus
                        </label>
                        <textarea
                          id={`comment-${partner.id}`}
                          value={comment}
                          onChange={(e) => {
                            setComment(e.target.value)
                            if (commentError) setCommentError(false)
                          }}
                          rows={3}
                          placeholder="Expliquez au partenaire la raison du refus (SIREN introuvable, objet social hors périmètre, pièces manquantes…)."
                          aria-invalid={commentError}
                          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                        />
                        {commentError && (
                          <p className="text-sm text-destructive">
                            Un motif est obligatoire pour refuser une demande.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => confirmRejection(partner)}
                          >
                            Confirmer le refus
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetRejection}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => approve(partner)}>
                          Valider
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(partner.id)
                            setComment("")
                            setCommentError(false)
                          }}
                        >
                          Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {sortedDecisions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Décisions récentes</CardTitle>
              <CardDescription>
                Traitées pendant cette session (simulation).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {sortedDecisions.map((decision, index) => (
                  <li key={decision.id}>
                    <div className="flex flex-col gap-1 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">{decision.company}</span>
                        <span
                          className={
                            decision.decision === "approved"
                              ? "text-sm font-medium text-positive"
                              : "text-sm font-medium text-destructive"
                          }
                        >
                          {decision.decision === "approved"
                            ? "Validé"
                            : "Refusé"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {decision.at}
                      </span>
                      {decision.comment && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Motif : </span>
                          {decision.comment}
                        </p>
                      )}
                    </div>
                    {index < sortedDecisions.length - 1 && <Separator />}
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
