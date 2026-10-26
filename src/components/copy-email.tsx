"use client";
import { useState } from "react";
import { site } from "@/content/site";
export function CopyEmail() {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(site.operator.email);
      setMessage("Email address copied.");
    } catch {
      setMessage(
        "Could not copy. Select the email address above to copy it manually.",
      );
    }
  }
  return (
    <div className="copy-email">
      <button className="text-link" onClick={copy}>
        Copy email address <span aria-hidden="true">⧉</span>
      </button>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
