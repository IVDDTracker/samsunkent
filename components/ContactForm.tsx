"use client";
import { useState } from "react";

interface Props {
  source: string;
  cta?: string;
  phonePlaceholder?: string;
  messagePlaceholder?: string;
  label?: string;
}

export default function ContactForm({
  source,
  cta = "Gönder →",
  phonePlaceholder = "Telefonun",
  messagePlaceholder = "Mesajın",
  label,
}: Props) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    if (!phone.trim()) {
      setState("err");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim(), source, hp }),
      });
      if (!res.ok) throw new Error();
      setState("ok");
      setPhone("");
      setMessage("");
    } catch {
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div className="ok" role="status">
        Teşekkürler! Notunu aldım, döneceğim. 📌
      </div>
    );
  }

  return (
    <form className="mini" onSubmit={submit}>
      {label && <label>{label}</label>}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={phonePlaceholder}
        required
        aria-label="Telefon numaran"
      />
      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={messagePlaceholder}
        aria-label="Mesajın"
      />
      <input
        className="hp"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
      />
      <button type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Gönderiliyor…" : cta}
      </button>
      {state === "err" && (
        <div className="err">Telefon numaranı yazıp tekrar dene.</div>
      )}
    </form>
  );
}
