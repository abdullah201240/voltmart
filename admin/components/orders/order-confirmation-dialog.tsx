"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Truck,
  MapPin,
  Banknote,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { confirmOrderWithVerification } from "@/lib/data/workflows";
import type { OrderDetail } from "@/lib/data/orders";

interface OrderConfirmationDialogProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrderConfirmationDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: OrderConfirmationDialogProps) {
  const appToast = useToast();
  const [phone, setPhone] = useState(
    order.customer.toLowerCase().includes("olivia")
      ? "+880 1711-482910"
      : "+880 1823-904123"
  );
  const [address, setAddress] = useState(order.shippingAddress || "Dhaka, Bangladesh");
  const [carrierPreference, setCarrierPreference] = useState("Pathao Courier Express");
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [hasAdvance, setHasAdvance] = useState(false);
  const [advanceTrxId, setAdvanceTrxId] = useState("");
  const [notes, setNotes] = useState("Customer confirmed item details and delivery address over phone call.");
  const [confirming, setConfirming] = useState(false);

  // Fraud risk simulation based on phone & delivery location
  const isDhaka = address.toLowerCase().includes("dhaka");
  const fraudScore = isDhaka ? 98 : 92; // 98% delivery success rate

  const codToCollect = Math.max(0, order.totalValue - (hasAdvance ? advancePaid : 0));

  const handleConfirm = () => {
    setConfirming(true);
    try {
      const res = confirmOrderWithVerification(order.id, order.customer, {
        phone,
        note: notes + (hasAdvance && advanceTrxId ? ` (bKash TrxID: ${advanceTrxId})` : ""),
        advancePaid: hasAdvance ? advancePaid : 0,
        codAmount: codToCollect,
        carrierPreference,
      });

      if (res.ok) {
        appToast.success("Order Confirmed", `${order.id} verified and queued for warehouse packing.`);
        onSuccess();
        onOpenChange(false);
      } else {
        appToast.error("Confirmation Failed", res.message);
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold">
              Confirm Order &amp; Customer Verification
            </DialogTitle>
          </div>
          <DialogDescription>
            Verify recipient details and COD terms for order <span className="font-mono font-semibold text-foreground">{order.id}</span> before releasing to the warehouse packing queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Bangladesh Courier Reliability Card */}
          <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-foreground">Steadfast &amp; Pathao Courier Trust Score</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold text-xs">
                {fraudScore}% Delivery Rate
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Low return risk. Recipient has successfully accepted 6 of 6 past deliveries across major Bangladesh 3PL couriers.
            </p>
          </div>

          {/* Customer & Contact Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> Contact Phone (Bangladesh)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                placeholder="+880 1711-XXXXXX"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> Preferred Courier
              </label>
              <select
                value={carrierPreference}
                onChange={(e) => setCarrierPreference(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Pathao Courier Express">Pathao Courier (Express 24h)</option>
                <option value="Steadfast Courier">Steadfast Courier (Doorstep COD)</option>
                <option value="RedX Courier">RedX Logistics</option>
                <option value="Paperfly">Paperfly Nationwide</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Verified Shipping Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="House, Road, Area, District/Thana"
            />
          </div>

          <Separator className="my-2" />

          {/* Advance Delivery Charge / COD Calculation */}
          <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Cash on Delivery &amp; Advance Payment
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={hasAdvance}
                  onChange={(e) => {
                    setHasAdvance(e.target.checked);
                    if (e.target.checked && advancePaid === 0) setAdvancePaid(150);
                  }}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Advance Charge Received (bKash/Nagad)
              </label>
            </div>

            {hasAdvance && (
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">Advance Amount (৳)</span>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-mono"
                    placeholder="150"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">bKash / Nagad TrxID</span>
                  <input
                    type="text"
                    value={advanceTrxId}
                    onChange={(e) => setAdvanceTrxId(e.target.value.toUpperCase())}
                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-mono uppercase"
                    placeholder="BL982034X"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Final COD Amount to Collect at Doorstep:</span>
              <span className="font-bold text-sm text-primary font-mono">
                ৳{codToCollect.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" /> Call &amp; Verification Note
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Customer confirmed order details..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {confirming ? "Confirming..." : "Confirm & Send to Packing Queue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
