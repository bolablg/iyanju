"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/site";
import { Wordmark, Arrow } from "./brand";
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" aria-label="iYANJU home" onClick={close}>
          <Wordmark />
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={
                path === item.href ||
                (item.href === "/tools" && path.startsWith("/tools/"))
                  ? "page"
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/account"
            prefetch={false}
            className="account-link"
            onClick={close}
            aria-current={path.startsWith("/account") ? "page" : undefined}
          >
            Account <Arrow diagonal />
          </Link>
        </nav>
      </div>
    </header>
  );
}
