"use client";

import { useEffect, useState } from "react";

function cleanNumber(input) {
  if (!input) return "";
  // remove non-digit characters and leading +
  return input.replace(/[^0-9]/g, "");
}

function isValidWhatsAppNumber(digits) {
  // basic validation: must be at least 6 digits and start with country code (no leading 0)
  return /^[1-9][0-9]{5,}$/.test(digits);
}

export default function ShareOrderModal({ open, onClose, order }) {
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      const pref = order?.customerWhatsApp || order?.cid || "";
      setNumber(pref || "");
      setError("");
    }
  }, [open, order]);

  if (!open) return null;

  function buildMessage() {
    const items = (order?.items || []).map((it) => `- ${it.name} × ${it.qty} — $${it.price}`).join("\n");
    return `Is this your order to confirm?\n\nCustomer: ${order?.customerName || "(unknown)"}\nPhone: ${number}\n\nOrder summary:\n${items}\n\nSubtotal: $${order?.subtotal || 0}\n\nIf this is correct, please reply CONFIRM.\n\n— OKPUPS`;
  }

  async function handleShare(e) {
    e.preventDefault();
    setError("");
    const digits = cleanNumber(number);
    if (!isValidWhatsAppNumber(digits)) {
      setError("Please enter a valid international phone number (e.g. 2348012345678)");
      return;
    }

    const msg = buildMessage();
    const encoded = encodeURIComponent(msg);
    const waLink = `https://wa.me/${digits}?text=${encoded}`;

    try {
      setSending(true);
      // open WhatsApp in a new tab/window
      window.open(waLink, "_blank");
      // optionally copy the message so admin can paste elsewhere
      try {
        await navigator.clipboard.writeText(msg);
      } catch (err) {
        // ignore clipboard errors
      }
      setSending(false);
      onClose();
    } catch (err) {
      setSending(false);
      setError("Failed to open WhatsApp. Try copying the number and message manually.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      <form
        onSubmit={handleShare}
        className="relative z-10 w-full max-w-lg rounded bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-order-title"
      >
        <h3 id="share-order-title" className="text-lg font-semibold">Share order via WhatsApp</h3>

        <p className="mt-2 text-sm text-gray-600">This will open WhatsApp with a prefilled message to the customer's number. The message will include customer name, phone and a neat order summary.</p>

        <label className="mt-4 block text-sm font-medium">Customer WhatsApp number</label>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="e.g. +2348012345678 or 2348012345678"
          aria-label="Customer WhatsApp number"
        />

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2">Cancel</button>
          <button type="submit" disabled={sending} className="rounded bg-green-600 px-3 py-2 text-white">
            {sending ? "Opening..." : "Share on WhatsApp"}
          </button>
        </div>
      </form>
    </div>
  );
}
