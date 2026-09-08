import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api"
import { hashPassword } from "../lib/hash"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldTitle,
} from "../components/ui/field"

import { Input } from "../components/ui/input"

type AuthResponse = {
  id: string
  mail: string
  name: string
}

function isValidSiren(value: string): boolean {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 9) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    let n = Number(digits[i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  return sum % 10 === 0
}


export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const [role, setRole] = useState<"Manant" | "Partner">("Manant")
  const [name, setName] = useState("")
  const [mail, setMail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [siren, setSiren] = useState("")
  const [social_object, setSocial_object] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sirenInvalid = siren.length === 9 && !isValidSiren(siren)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (role === "Partner" && !isValidSiren(siren)) {
      setError("Le SIREN saisi n'est pas valide.")
      return
    }

    setLoading(true)

    try {
      await api<AuthResponse>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail,
          name,
          password: await hashPassword(password),
          role,
          siren: role === "Partner" ? Number(siren) : undefined,
          social_object: role === "Partner" ? social_object : undefined,
        }),
      })

      navigate("/login")
    } catch {
      setError("Impossible de créer le compte. Vérifiez vos informations.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Renseignez vos informations ci-dessous pour créer votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Vous êtes</FieldLegend>
              <div className="grid grid-cols-2 gap-3">
                <FieldLabel
                  htmlFor="role-Manant"
                  className="has-checked:border-primary/40 has-checked:bg-primary/5"
                >
                  <Field orientation="horizontal">
                    <input
                      id="role-Manant"
                      type="radio"
                      name="role"
                      value="Manant"
                      defaultChecked
                      checked={role === "Manant"}
                      onChange={() => setRole("Manant")}
                      required
                      className="size-4 accent-primary"
                    />
                    <FieldContent>
                      <FieldTitle>Employé</FieldTitle>
                    </FieldContent>
                  </Field>
                </FieldLabel>
                <FieldLabel
                  htmlFor="role-Partner"
                  className="has-checked:border-primary/40 has-checked:bg-primary/5"
                >
                  <Field orientation="horizontal">
                    <input
                      id="role-Partner"
                      type="radio"
                      name="role"
                      value="Partner"
                      checked={role === "Partner"}
                      onChange={() => setRole("Partner")}
                      required
                      className="size-4 accent-primary"
                    />
                    <FieldContent>
                      <FieldTitle>Partenaire</FieldTitle>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              </div>
            </FieldSet>
            {role === "Partner" && (
              <>
                <Field>
                  <FieldLabel htmlFor="siren">SIREN</FieldLabel>
                  <Input
                    id="siren"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="123456789"
                    maxLength={9}
                    value={siren}
                    onChange={(e) =>
                      setSiren(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    aria-invalid={sirenInvalid}
                    required
                  />
                  {sirenInvalid ? (
                    <FieldError>Le SIREN saisi n'est pas valide.</FieldError>
                  ) : (
                    <FieldDescription>
                      Numéro SIREN à 9 chiffres de votre entreprise.
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="social-object">Objet social</FieldLabel>
                  <Input
                    id="social-object"
                    type="text"
                    placeholder="Objet social"
                    maxLength={255}
                    value={social_object}
                    onChange={(e) =>
                      setSocial_object(e.target.value)
                    }
                    required
                  />
                  <FieldDescription>
                    Objet social de votre entreprise.
                  </FieldDescription>
                </Field>
              </>
            )}
            <Field>
              <FieldLabel htmlFor="name">
                {role === "Partner" ? "Nom de l'entreprise" : "Nom complet"}
              </FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder={role === "Partner" ? "Ma Société SARL" : "Jean Dupont"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="jean@exemple.com"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
              />
              <FieldDescription>
                Nous l'utiliserons pour vous contacter. Votre adresse ne sera
                jamais partagée.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FieldDescription>
                Au moins 8 caractères.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmer le mot de passe
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                minLength={8}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FieldDescription>Veuillez confirmer votre mot de passe.</FieldDescription>
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Création…" : "Créer le compte"}
                </Button>
                <FieldDescription className="text-center">
                  Vous avez déjà un compte ?{" "}
                  <Link to="/login" className="underline font-medium text-primary">
                    Se connecter
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
