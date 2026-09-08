import { useEffect, useMemo, useState } from "react"
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
import { api } from "../../api"

type PendingPartnerApi = {
  id: string
  name: string
  mail: string
  siren: number | null
  social_obj: string | null
  requested_at: number
}

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

function formatDate(value: number): string {
  return new Date(value * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function nowLabel(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AdminPartnerValidationPage() {
  const [pending, setPending] = useState<PendingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [commentError, setCommentError] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<PendingPartnerApi[]>("/admin/partners/pending")
      .then((partners) => {
        if (cancelled) return
        setPending(
          partners.map((p) => ({
            id: p.id,
            company: p.name,
            siren: p.siren?.toString() ?? "—",
            socialObject: p.social_obj ?? "—",
            mail: p.mail,
            requestedAt: formatDate(p.requested_at),
          })),
        )
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer les demandes en attente.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sortedDecisions = useMemo(
    () => [...decisions].reverse(),
    [decisions],
  )

  function resetRejection() {
    setRejectingId(null)
    setComment("")
    setCommentError(false)
  }

  async function approve(partner: PendingPartner) {
    setActionError(null)
    setActingId(partner.id)
    try {
      await api(`/states/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: "active",
          reason: "Validé par l'administrateur",
        }),
      })
      await api(`/partners/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification: true }),
      })
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
    } catch {
      setActionError(`Impossible de valider "${partner.company}" pour le moment.`)
    } finally {
      setActingId(null)
    }
  }

  async function confirmRejection(partner: PendingPartner) {
    if (!comment.trim()) {
      setCommentError(true)
      return
    }
    setActionError(null)
    setActingId(partner.id)
    try {
      await api(`/states/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "rejected", reason: comment.trim() }),
      })
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
    } catch {
      setActionError(`Impossible de refuser "${partner.company}" pour le moment.`)
    } finally {
      setActingId(null)
    }
  }

  return (
    <Watermark text="DEMANDES ET DÉCISIONS RÉELLES">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div>
          <h1 className="text-2xl font-semibold">
            Validation des demandes partenaires
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Chargement…"
              : pending.length === 0
                ? "Aucune demande en attente."
                : `${pending.length} demande${
                    pending.length > 1 ? "s" : ""
                  } en attente de validation.`}
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

        {!loading && !error && pending.length === 0 ? (
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
                            disabled={actingId === partner.id}
                            onClick={() => confirmRejection(partner)}
                          >
                            {actingId === partner.id
                              ? "Refus…"
                              : "Confirmer le refus"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={actingId === partner.id}
                            onClick={resetRejection}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={actingId === partner.id}
                          onClick={() => approve(partner)}
                        >
                          {actingId === partner.id ? "Validation…" : "Valider"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actingId === partner.id}
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
                Traitées pendant cette session.
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
