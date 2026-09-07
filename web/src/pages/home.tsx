import { Link } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"
import { Watermark } from "../components/Watermark"
import { Footer } from "../components/Footer"

const features = [
  {
    title: "Solde en temps réel",
    description: "Consultez à tout moment le montant disponible sur votre CartePro.",
  },
  {
    title: "Paiement par QR code",
    description: "Générez un QR code et payez chez tous nos partenaires en un scan.",
  },
  {
    title: "Historique détaillé",
    description: "Retrouvez chaque transaction, crédit comme débit, au même endroit.",
  },
]

export default function HomePage() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="font-heading text-lg font-semibold text-primary"
          >
            CartePro
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-primary hover:text-primary!",
              })}
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <Watermark
        text="SIMULATION — SITE DE DÉMONSTRATION"
        className="min-h-0 flex-1"
      >
        <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 overflow-hidden px-6 py-8 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
              Avantages salariés dématérialisés
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Votre CartePro,
              <br />
              partout, à tout moment.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Consultez votre solde, payez chez nos partenaires par QR code et
              suivez vos transactions — le tout depuis une seule application.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className={buttonVariants({ size: "lg" })}>
                Se connecter
              </Link>
              <Link
                to="/signup"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <img
              src="/public/carte_tickettout.png"
              alt="Carte CartePro"
              className="w-full rounded-2xl shadow-xl"
            />
            <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-brand-accent/15" />
            <div className="absolute -bottom-6 -left-6 -z-10 h-28 w-28 rounded-full bg-c-accent-2/15" />
          </div>
        </section>

        <section className="shrink-0 border-t border-border bg-c-gris-clair">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </Watermark>
    </div>
  )
}
