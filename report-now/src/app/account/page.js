"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" }); // "success" | "error" | ""

  // Derive initials for avatar
  const initials = useMemo(() => {
    const name =
      (session && session.user && session.user.name && session.user.name.trim()) || "";
    if (!name) return "?";
    const parts = name.split(/\s+/);
    return ((parts[0] && parts[0][0]) || "")
      .concat((parts[1] && parts[1][0]) || "")
      .toUpperCase();
  }, [session && session.user && session.user.name]);

  // Populate form with user data when session is available
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session && session.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.contactNumber || session.user.phone || "",
      });
    }

    const t = setTimeout(() => setIsPrefilling(false), 250);
    return () => clearTimeout(t);
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error((data && data.error) || "Something went wrong");

      await update({
        ...session,
        user: {
          ...(session && session.user),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      });
      
      // Is used in InlineAlert
      setMessage({ text: "Profile updated successfully.", type: "success" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage({ text: (err && err.message) || "Failed to update profile.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <TopLoader active />
        <PageHeaderSkeleton />
        <div className="mt-8 grid gap-6 md:grid-cols-5">
          <CardSkeleton className="md:col-span-2" />
          <CardSkeleton className="md:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <TopLoader active={isLoading} />

      <PageHeader
        title="Account"
        subtitle="Manage your personal information and how we contact you."
      />

      {message.text ? (
        <div className="mt-4">
          <InlineAlert
            type={message.type === "success" ? "success" : "error"}
            title={message.type === "success" ? "Saved" : "Update failed"}
            description={message.text}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-5">
        {/* Profile summary */}
        <section className="md:col-span-2">
          <Card>
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/10">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xl font-semibold">
                  {initials}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {formData.name || "Your name"}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-600">
                  {formData.email || "you@example.com"}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center justify-between">
                <span>Account status</span>
                <Badge tone="green">Active</Badge>
              </li>
              {/*
              <li className="flex items-center justify-between">
                <span>Auth provider</span>
                <span className="font-medium text-slate-800">
                  {session && session.user ? "NextAuth" : "—"}
                </span>
              </li>
              */}
              <li className="flex items-center justify-between">
                <span>Role</span>
                <span className="font-medium text-slate-800">
                  {(session && session.user && session.user.role) || "User"}
                </span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Editable form */}
        <section className="md:col-span-3">
          <Card>
            <header className="mb-6">
              <h3 className="text-base font-semibold leading-6 tracking-tight text-slate-900">
                Profile details
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Make sure your name, email, and phone are up to date.
              </p>
            </header>

            {isPrefilling ? (
              <FormSkeleton />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Field label="Name" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="Your full name"
                  />
                </Field>

                <Field label="Email address" htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field label="Phone number" htmlFor="phone" hint="Include country code if outside SG">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="e.g. +65 9123 4567"
                  />
                </Field>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!session || !session.user) return;
                      setFormData({
                        name: session.user.name || "",
                        email: session.user.email || "",
                        phone: session.user.contactNumber || session.user.phone || "",
                      });
                      setMessage({ text: "Reverted unsaved changes.", type: "success" });
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]-800"
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60-100"
                  >
                    {isLoading ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

/* ——— UI PRIMITIVES (lightweight components) ——— */

const inputClassName = [
  "w-full",
  "h-10",
  "rounded-xl",
  "border",
  "border-slate-300",
  "bg-white",
  "px-3",
  "text-sm",
  "outline-none",
  "ring-0",
  "transition",
  "placeholder:text-slate-400",
  "focus:border-slate-400",
  "focus:ring-2",
  "focus:ring-slate-200",
].join(" ");

function PageHeader({ title, subtitle }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm text-slate-600">{subtitle}</p>
      ) : null}
    </header>
  );
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-800"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function InlineAlert({ type, title, description }) {
  const base = "rounded-xl border px-4 py-3 text-sm flex items-start gap-3";
  const tone =
    type === "success"
      ? "border-emerald-300/60 bg-emerald-50 text-emerald-900"
      : "border-rose-300/60 bg-rose-50 text-rose-900";
  return (
    <div className={`${base} ${tone}`} role="status" aria-live="polite">
      <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-current opacity-75" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-slate-700/90">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const palette = {
    slate:
      "bg-slate-100 text-slate-800 ring-1 ring-inset ring-black/10",
    green:
      "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-black/10",
    amber:
      "bg-amber-100 text-amber-900 ring-1 ring-inset ring-black/10",
    rose:
      "bg-rose-100 text-rose-900 ring-1 ring-inset ring-black/10",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${palette[tone]}`}>
      {children}
    </span>
  );
}

function Separator({ className = "" }) {
  return <div className={`h-px w-full bg-slate-200 ${className}`} />;
}

function Card({ children, className = "" }) {
  return (
    <section
      className={
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition " +
        className
      }
    >
      {children}
    </section>
  );
}

function TopLoader({ active }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 w-full overflow-hidden ${
        active ? "opacity-100" : "opacity-0"
      } transition-opacity`}
      aria-hidden
    >
      <div className="h-full w-full origin-left animate-[loader_1.2s_ease-in-out_infinite] bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
      <style>{`
        @keyframes loader {
          0% { transform: scaleX(0.05); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(0.05); }
        }
      `}</style>
    </div>
  );
}

/* ——— Skeletons ——— */
function CardSkeleton({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 p-6 shadow-sm ${className}`}>
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 grid gap-3">
        <div className="h-9 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid gap-1.5">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
      ))}
      <div className="mt-2 flex justify-end gap-3">
        <div className="h-10 w-20 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
