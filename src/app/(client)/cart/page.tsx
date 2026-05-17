// src/app/(client)/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/stores/useCartStore";
import { getTableToken } from "@/lib/table-session";
import { useCheckout } from "@/hooks/useCheckout";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemCard } from "@/components/client/cart/CartItemCard";
import { CartSummary } from "@/components/client/cart/CartSummary";
import { SuccessState } from "@/components/client/cart/SuccessState";
import { ErrorState } from "@/components/client/cart/ErrorState";

const formatPrice = (cents: number): string => {
  if (typeof cents !== "number" || isNaN(cents)) return "0,00";
  return (cents / 100).toFixed(2).replace(".", ",");
};

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem } = useCartStore();
  const { status, error, totalCents, checkout } = useCheckout();

  // 🔧 FIX: Inizializza con fallback per evitare hydration mismatch
  const [menuHref, setMenuHref] = useState("/");

  // 🔧 FIX: Aggiorna il link solo dopo l'idratazione (client-side)
  useEffect(() => {
    const token = getTableToken();
    if (token) {
      setMenuHref(`/order/${token}`);
    }
  }, []);

  if (status === "success") {
    return <SuccessState />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/40 via-white to-white p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Il carrello è vuoto
            </h2>
            <p className="text-gray-600">
              Aggiungi qualche piatto dal menu per procedere con l'ordine.
            </p>
          </div>

          <Link href={menuHref} className="block w-full">
            <Button className="w-full bg-gray-900 hover:bg-green-600 text-white font-bold py-6 rounded-xl transition-all">
              Torna al Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Il tuo Ordine
          </h1>
          <Link href={menuHref}>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-green-700 border-gray-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" /> Menu
            </Button>
          </Link>
        </div>

        {error && <ErrorState error={error} />}

        <div className="space-y-3">
          {/* ✅ FIX: Key univoca composita per evitare errori React */}
          {items.map((item) => {
            const uniqueKey = `${item.menuItemId}-${JSON.stringify(item.customizations ?? {})}`;
            
            return (
              <CartItemCard
                key={uniqueKey}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                formatPrice={formatPrice}
              />
            );
          })}
        </div>

        <CartSummary
          totalCents={totalCents}
          loading={status === "submitting"}
          onCheckout={checkout}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
}