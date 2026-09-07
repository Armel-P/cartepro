import { buttonVariants } from "../components/ui/button"
import { Footer } from "../components/Footer"

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="font-heading text-lg font-semibold text-primary">
          CartePro
        </span>
        <h1 className="text-3xl font-bold text-foreground">
          Une erreur est survenue
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Le service est momentanément indisponible. Merci de réessayer dans
          quelques instants.
        </p>
        <a href="/" className={buttonVariants({ size: "lg" })}>
          Retour à l'accueil
        </a>
      </main>
      <Footer />
    </div>
  )
}
