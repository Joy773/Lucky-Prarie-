"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200";

const labelClassName =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export default function LogInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: unknown = await response.json().catch(() => ({}));
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Something went wrong.";

      if (!response.ok) {
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      toast.success("Signed in successfully.");
      router.replace("/admin/dashboard");
    } catch {
      const message = "Could not reach the server. Try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Sign in</h2>
        <p className="mt-1 text-sm text-slate-600">Use your admin credentials.</p>
      </div>

      <label className="block">
        <span className={labelClassName}>Email</span>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputClassName}
        />
      </label>

      <label className="block">
        <span className={labelClassName}>Password</span>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className={inputClassName}
        />
      </label>

      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
