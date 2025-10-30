"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "./ui/navigation-menu";
import { User2, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/issues", label: "View Issues" },
  { href: "/issues/map", label: "Map" },
  { href: "/issues/report", label: "Report Issue" },
  { href: "/issues/my", label: "My Issues" },
];

const brandWrapperClasses =
  "flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--color-primary-50)]";

export default function NavBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = useMemo(() => {
    const normalized = pathname?.replace(/\/$/, "") || "/";

    return (href) => {
      const cleaned = href.replace(/\/$/, "") || "/";

      if (cleaned === "/issues") {
        return normalized === "/issues";
      }

      if (cleaned === "/") {
        return normalized === "/";
      }

      return normalized.startsWith(cleaned);
    };
  }, [pathname]);

  const handleNavigate = (href) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <nav className="bg-transparent text-[color:var(--color-foreground)] py-2 z-999">
      <div className="mx-auto w-full max-w-[840px] rounded-full border border-white/30 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex h-14 items-center px-3 sm:px-4">
          <Link
            href="/issues"
            className="flex items-center gap-3 text-lg font-semibold text-[color:var(--color-foreground)]"
          >
            <span className={brandWrapperClasses}>
              <Image
                src="/ReportNow.png"
                alt="ReportNow Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
            </span>
            <span>ReportNow</span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <NavigationMenu className="hidden md:flex justify-end" viewport={false}>
              <NavigationMenuList className="justify-end gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = isActivePath(item.href);

                  return (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        asChild
                        data-active={active}
                        className="font-medium whitespace-nowrap px-3"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}

                {session && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="gap-2 px-3">
                      <User2 className="h-4 w-4 text-[color:var(--color-muted)]" />
                      <span className="max-w-[12rem] truncate">
                        {session.user?.name || session.user?.email}
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-56 rounded-md bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]">
                        <div className="grid gap-1 p-1">
                          <button
                            type="button"
                            onClick={() => router.push("/account")}
                            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition hover:bg-[color:var(--color-primary-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          >
                            <Settings className="h-4 w-4" />
                            Manage Account
                          </button>
                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[color:var(--color-danger-500)] transition hover:bg-[color:var(--color-primary-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {!session && (
              <button
                type="button"
                onClick={() => handleNavigate("/")}
                className="rounded-md bg-[color:var(--color-primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--color-border)] text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-primary-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mx-auto mt-2 w-full max-w-[640px] rounded-2xl border border-white/30 bg-white/60 backdrop-blur-md shadow-sm md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4 sm:px-6">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(item.href);

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                    active
                      ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]"
                      : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-primary-50)]"
                  }`}
                >
                  {item.label}
                  {/* no dot indicator */}
                </button>
              );
            })}

            {session && (
              <div className="mt-2 border-t border-[color:var(--color-border)] pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate("/account")}
                  className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-[color:var(--color-primary-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <Settings className="h-4 w-4" /> Manage Account
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[color:var(--color-danger-500)] transition hover:bg-[color:var(--color-primary-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
