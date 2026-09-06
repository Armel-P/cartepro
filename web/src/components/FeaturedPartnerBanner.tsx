import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PARTNERS, type Partner } from "../data/partners"
import { getCurrentFeatured, recordFeaturedClick } from "../lib/featured"

function readFeaturedPartner(): Partner | null {
  const current = getCurrentFeatured()
  return current
    ? (PARTNERS.find((p) => p.id === current.partnerId) ?? null)
    : null
}

/**
 * Encart "coup de cœur" en haut de la page d'accueil salarié.
 * Lit le partenaire mis en avant par l'admin (voir src/lib/featured.ts —
 * placeholder localStorage en attendant une route backend dédiée) et
 * n'affiche rien si aucun partenaire n'est actuellement mis en avant.
 */
export function FeaturedPartnerBanner() {
  const navigate = useNavigate()
  const [partner] = useState<Partner | null>(readFeaturedPartner)

  if (!partner) return null

  function handleClick() {
    if (!partner) return
    recordFeaturedClick(partner.id)
    navigate("/EmployeePages/partners")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full items-center gap-4 overflow-hidden rounded-xl bg-card p-3 text-left ring-1 ring-foreground/10 transition hover:ring-primary/40"
    >
      <img
        src={partner.image}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent">
          Coup de cœur du moment
        </span>
        <span className="truncate font-medium text-foreground">
          {partner.name}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {partner.description}
        </span>
      </div>
      <span className="ml-auto shrink-0 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
        Découvrir →
      </span>
    </button>
  )
}
