import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { clearUser, getUser } from "../auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

type NavLink = { href: string; label: string };

const NAV_LINKS_BY_ROLE: Record<string, NavLink[]> = {
  Manant: [
    { href: "/EmployeePages/balance", label: "Porte-monnaie" },
    { href: "/EmployeePages/payment", label: "Transaction" },
    { href: "/EmployeePages/partners", label: "Partenaires" },
  ],
  Partner: [
    { href: "/PartnerPages/scan", label: "Encaisser" },
    { href: "/PartnerPages/dashboard", label: "Tableau de bord" },
    { href: "/PartnerPages/partners", label: "Partenaires" },
  ],
  Admin: [
    { href: "/AdminPages/partnerValidation", label: "Validation partenaires" },
    { href: "/AdminPages/userList", label: "Gestion des comptes" },
  ],
};

const SETTINGS_HREF = "/settings";

export function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const navLinks = user?.role ? (NAV_LINKS_BY_ROLE[user.role] ?? []) : [];

  function handleLogout() {
    clearUser();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b bg-background">
      <div className="flex h-20 w-full items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a
            className="block shrink-0 px-2 py-2 font-heading text-2xl font-semibold text-primary"
            href="/"
          >
            CartePro
          </a>
          <nav
            aria-label="Global"
            className="ml-10 hidden md:block"
          >
            <ul className="flex items-center gap-10 text-xl">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="text-muted-foreground transition hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-4">

          <div className="hidden items-center gap-4 sm:flex">
            <button
              onClick={handleLogout}
              className="block rounded-md border border-primary/40 px-5 py-2.5 text-xl font-medium text-primary transition hover:bg-primary/5 hover:border-primary/60"
            >
              Se déconnecter
            </button>

            <a href={SETTINGS_HREF} className="px-2 py-2.5 text-xl font-medium text-primary">
              {user?.name ?? "Invité"}
            </a>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground transition hover:bg-muted/70 md:hidden"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              }
            />
            <SheetContent
              side="right"
              className="w-full bg-background sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="ml-4 mt-8 flex flex-col gap-6 text-lg">
                <a href="/">Accueil</a>
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={handleLogout}
                  className="text-left text-primary"
                >
                  Se déconnecter
                </button>
              </nav >
            </SheetContent >
          </Sheet >
        </div >
      </div >
    </header >
  );
}
