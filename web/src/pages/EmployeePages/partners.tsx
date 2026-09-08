import { useEffect, useMemo, useState } from "react"
import MediaCard from "../../components/ui/mediacard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { api } from "../../api";
import "../../assets/css/global.css";

type PartnerDirectoryEntry = {
  id: string
  social_obj: string | null
  category: string | null
}

const PAGE_SIZE = 6

export default function EmployeePartnersPage() {
  const [partners, setPartners] = useState<PartnerDirectoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return partners
    return partners.filter((partner) => {
      const name = partner.social_obj?.toLowerCase() ?? ""
      const category = partner.category?.toLowerCase() ?? ""
      return name.includes(q) || category.includes(q)
    })
  }, [partners, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<PartnerDirectoryEntry[]>("/directory")
      .then((data) => {
        if (cancelled) return
        setPartners(data)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError("Impossible de récupérer la liste des partenaires.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mt-10 px-4 py-8 sm:px-6 lg:px-8">
      {!loading && !error && partners.length > 0 && (
        <div className="mx-auto mb-10 max-w-sm">
          <Input
            placeholder="Rechercher un partenaire ou une catégorie…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      {loading && (
        <p className="text-center text-sm text-muted-foreground">
          Chargement…
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
      {!loading && !error && partners.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Aucun partenaire référencé pour le moment.
        </p>
      )}
      {!loading && !error && partners.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Aucun partenaire ne correspond à cette recherche.
        </p>
      )}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          justify-items-center
          gap-y-20
          md:gap-x-10
          lg:gap-x-6
        "
      >
        {paginated.map((partner, index) => (
          <div
            key={partner.id}
            className="animate-card-in"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            <MediaCard
              name={partner.social_obj ?? "Partenaire"}
              type={partner.category ?? "Non catégorisé"}
              address="Adresse non communiquée"
              description={partner.category ?? ""}
              image={`https://placehold.co/600x400?text=${encodeURIComponent(
                partner.social_obj ?? "Partenaire",
              )}`}
            />
          </div>
        ))}
      </div>

      {!loading && !error && filtered.length > PAGE_SIZE && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </main>
  );
}
