"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/formatCurrency";
import { useCartStore } from "../lib/useCart";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

function cartSubtotal(items) {
  return (items || []).reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
    0
  );
}

function whatsappNumber() {
  // e.g. "2348012345678" (digits only)
  return String(process.env.NEXT_PUBLIC_OKPUPS_WHATSAPP_NUMBER || "").replace(/\D/g, "");
}

function buildWhatsAppMessage({ name }) {
  const who = (name || "").trim() || "Customer";
  // professional, sales-driven prefill without order details
  return `Hi OKPUPS Team — my name is ${who}. I'm ready to make payment for my order now. Please send payment instructions and confirm availability. Thank you!`;
}

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  const [step, setStep] = useState("cart"); // cart | checkout
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("cart");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function submitOrder() {
    setError(null);
    const trimmedName = String(name || "").trim();
    const trimmedPhone = String(phone || "").trim();

    if (!items?.length) return setError("Your cart is empty.");
    if (trimmedName.length < 2) return setError("Please enter your name.");
    if (trimmedPhone.length < 5) return setError("Please enter your WhatsApp number.");

    const wa = whatsappNumber();
    if (!wa) {
      return setError(
        "WhatsApp payment number is not configured. Set NEXT_PUBLIC_OKPUPS_WHATSAPP_NUMBER in the frontend env."
      );
    }

    setBusy(true);
    try {
      const payload = {
        customerName: trimmedName,
        customerWhatsApp: trimmedPhone,
        currency: "USD",
        items: items.map((it) => ({
          itemType: it._type,
          itemId: it._id,
          name: it.name,
          price: Number(it.price || 0),
          qty: Number(it.qty || 1)
        }))
      };

      const res = await api.post("/orders", payload);
      const orderId = res?.order?._id;

      const message = buildWhatsAppMessage({ name: trimmedName });

      clear();

      const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;

      // show glassy lime thank-you toast, then redirect
      setShowThanks(true);
      setBusy(false);
      setTimeout(() => {
        // redirect to WhatsApp after short pause
        window.location.href = url;
      }, 1200);
    } catch (e) {
      setError(e?.message || "Failed to place order");
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DrawerContent direction="right" className="bg-white/95 backdrop-blur-sm border-l">
          <DrawerHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <DrawerTitle>Cart</DrawerTitle>
                <DrawerDescription className="text-sm text-gray-600">Your cart and checkout</DrawerDescription>
              </div>
              <DrawerClose className="rounded border px-3 py-1 text-sm">Close</DrawerClose>
            </div>
          </DrawerHeader>

        <div className="flex-1 overflow-auto p-4">
          {step === "cart" && (
            <>
              {!items.length ? (
                <div className="text-sm text-gray-600">Your cart is empty.</div>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => (
                    <div key={`${it._type}-${it._id}`} className="rounded border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{it.name}</div>
                          <div className="text-xs text-gray-500">{it._type}</div>
                          <div className="mt-1 text-sm">{formatCurrency(it.price || 0)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(it._id, it._type)}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">Qty</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="h-8 w-8 rounded border"
                            onClick={() => {
                              const next = Math.max(1, Number(it.qty || 1) - 1);
                              removeItem(it._id, it._type);
                              addItem({ ...it, qty: next });
                            }}
                          >
                            −
                          </button>
                          <div className="w-8 text-center text-sm font-medium">{it.qty || 1}</div>
                          <button
                            type="button"
                            className="h-8 w-8 rounded border"
                            onClick={() => addItem({ ...it, qty: 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === "checkout" && (
            <>
              <div className="mb-3 rounded border bg-gray-50 p-3 text-sm text-gray-700">
                You will pay directly to our receptionist on WhatsApp. They will confirm your order after payment.
              </div>

              <div className="rounded border p-3">
                <div className="font-semibold mb-2">Order summary</div>
                <div className="space-y-1 text-sm text-gray-700">
                  {items.map((it) => (
                    <div key={`${it._type}-${it._id}`} className="flex justify-between gap-2">
                      <div className="truncate">{it.name} x{it.qty || 1}</div>
                      <div className="shrink-0">
                        {formatCurrency(Number(it.price || 0) * Number(it.qty || 0))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div className="font-semibold">Total</div>
                  <div className="font-semibold">{formatCurrency(subtotal)}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  <div className="mb-1 font-medium">Your name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border p-2"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block text-sm">
                  <div className="mb-1 font-medium">Your WhatsApp number</div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded border p-2"
                    placeholder="e.g. +234..."
                  />
                </label>

                {error && <div className="text-sm text-red-600">{error}</div>}
              </div>
            </>
          )}
        </div>

        <DrawerFooter>
          {step === "cart" ? (
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">Subtotal</div>
                <div className="font-semibold">{formatCurrency(subtotal)}</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded border px-4 py-2 text-sm"
                  onClick={() => clear()}
                  disabled={!items.length}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="flex-1 rounded bg-black px-4 py-2 text-sm text-white disabled:bg-gray-400"
                  onClick={() => setStep("checkout")}
                  disabled={!items.length}
                >
                  Checkout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                type="button"
                className="flex-1 rounded border px-4 py-2 text-sm"
                onClick={() => setStep("cart")}
                disabled={busy}
              >
                Back
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-black px-4 py-2 text-sm text-white disabled:bg-gray-400"
                onClick={submitOrder}
                disabled={busy}
              >
                {busy ? "Placing..." : "Confirm & WhatsApp"}
              </button>
            </div>
          )}
        </DrawerFooter>
        {showThanks && (
          <div className="fixed bottom-6 right-6 z-60 transform-gpu rounded-md bg-lime-600/95 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
            <div className="font-medium">Thank you! Your request was sent.</div>
            <div className="text-sm text-lime-100 opacity-90">We'll respond on WhatsApp shortly.</div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
