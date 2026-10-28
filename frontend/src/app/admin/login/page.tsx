"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isReady, user, login } = useAdminAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (isReady && user) router.replace("/admin"); }, [isReady, user, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setError("");
    try {
      await login(String(values.get("email") ?? "").trim(), String(values.get("password") ?? ""));
      router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "We couldn't sign you in. Try again.");
    } finally { setPending(false); }
  }

  if (!isReady) return <div className="admin-loading" role="status">Checking your session…</div>;
  return (
    <main className="login-shell">
      <section className="login-story">
        <Link className="brand" href="/"><span className="brand-mark">w</span><span className="brand-name">Wisey<small>TUTORS</small></span></Link>
        <div className="login-story-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Team workspace</span><h1>Good learning starts with a <em>good conversation.</em></h1><p>Keep track of new learner enquiries, session requests, and the next helpful step for each family.</p></div>
        <span className="eyebrow"><ShieldCheck size={14} /> Private staff access</span>
      </section>
      <section className="login-form-wrap"><form className="login-form" onSubmit={submit}>
        <span className="eyebrow"><span className="eyebrow-dot" /> Welcome back</span><h2>Sign in to Wisey</h2><p>Use the staff account provided by your administrator.</p>
        {error && <div className="inbox-error" role="alert">{error}</div>}
        <div className="form-field"><label htmlFor="admin-email">Email</label><input id="admin-email" name="email" type="email" autoComplete="username" required /></div>
        <div className="form-field"><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="button" type="submit" disabled={pending}>{pending ? <>Signing in <LoaderCircle className="spin" /></> : <>Sign in <ArrowRight /></>}</button>
        <Link className="login-back" href="/"><ArrowLeft size={14} /> Back to Wisey Tutors</Link>
      </form></section>
    </main>
  );
}
