import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { isLoggedIn } from "./auth"
import Home from "./pages/home"
import Login from "./pages/login"
import Signup from "./pages/signup"
import PartnerPaymentPage from "./pages/PartnerPages/payment"
import PartnerScanPage from "./pages/PartnerPages/scan"
import AdminPartnerValidationPage from "./pages/AdminPages/partnerValidation"
import AdminUserListPage from "./pages/AdminPages/userList"
import EmployeePaymentPage from "./pages/EmployeePages/payment"
import EmployeeBalancePage from "./pages/EmployeePages/ballance"
import EmployeePartnersPage from "./pages/EmployeePages/partners"
import EmployeeSettingsPage from "./pages/EmployeePages/settings"
import NotFoundPage from "./pages/NotFound"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return (
    <>
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/EmployeePages/payment"
          element={<RequireAuth><Header /><EmployeePaymentPage /></RequireAuth>}
        />
        <Route
          path="/EmployeePages/balance"
          element={<RequireAuth><Header /><EmployeeBalancePage /></RequireAuth>}
        />
        <Route
          path="/EmployeePages/partners"
          element={<RequireAuth><Header /><EmployeePartnersPage /></RequireAuth>}
        />
        <Route
          path="/EmployeePages/settings"
          element={<RequireAuth><Header/><EmployeeSettingsPage /></RequireAuth>}
        />
        <Route
          path="/PartnerPages/payment"
          element={<RequireAuth><Header /><PartnerPaymentPage /></RequireAuth>}
        />
        <Route
          path="/PartnerPages/scan"
          element={<RequireAuth><Header /><PartnerScanPage /></RequireAuth>}
        />
        <Route
          path="/AdminPages/partnerValidation"
          element={<RequireAuth><Header /><AdminPartnerValidationPage /></RequireAuth>}
        />
        <Route
          path="/AdminPages/userList"
          element={<RequireAuth><Header /><AdminUserListPage /></RequireAuth>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
