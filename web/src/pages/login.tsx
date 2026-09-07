import { Navigate } from "react-router-dom"
import { isLoggedIn } from "../auth"
import { LoginForm } from "../components/login-form"
import { Footer } from "../components/Footer"

export default function LoginPage() {
  if (isLoggedIn()) {
    return <Navigate to="/EmployeePages/balance" replace />
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <div className="flex flex-1 flex-col items-center justify-center p-6 pt-0 md:p-10 md:pt-0">
        <div className="w-full max-w-sm md:max-w-4xl">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}

