"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["Subjects", "#subjects"],
  ["How it works", "#approach"],
  ["Our approach", "#match"],
  ["FAQs", "#faq"],
] as const;

export function Brand({ href = "/" }: { href?: string }) {
  return <Link className="brand" href={href} aria-label="Wisey Tutors home"><span className="brand-mark" aria-hidden="true">w</span><span className="brand-name">Wisey<small>TUTORS</small></span></Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="staff-link link-arrow" href="/admin/login">Staff sign in <ArrowUpRight aria-hidden="true" /></Link>
          <Link className="button" href="#contact">Find your fit <ArrowUpRight aria-hidden="true" /></Link>
          <button className="mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav${open ? " open" : ""}`} aria-label="Mobile navigation" aria-hidden={!open}>
        {links.map(([label, href]) => <Link key={href} href={href} onClick={close}>{label}</Link>)}
        <Link href="/admin/login" onClick={close}>Staff sign in</Link>
      </nav>
    </header>
  );
}
