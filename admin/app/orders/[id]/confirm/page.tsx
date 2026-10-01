"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Truck,
  MapPin,
  Banknote,
  FileCheck,
  User,
  Package,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { getOrderById, type OrderDetail } from "@/lib/data/orders";
import { confirmOrderWithVerification } from "@/lib/data/workflows";

export default function OrderConfirmPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appToast = useToast();

  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [loading, setLoading] = useState(true);

  // Form State
  const [phone, setPhone] = useState("+880 1711-482910");
  const [address, setAddress] = useState("");
  const [carrierPreference, setCarrierPreference] = useState("Pathao Courier Express");
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [hasAdvance, setHasAdvance] = useState(false);
  const [advanceTrxId, setAdvanceTrxId] = useState("");
  const [notes, setNotes] = useState("Customer verified product specifications and confirmed COD acceptance via phone call.");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let alive = true;
    getOrderById(params.id).then((data) => {
      if (alive) {
        setOrder(data);
        if (data) {
          setAddress(data.shippingAddress || "House 42, Road 11, Banani, Dhaka 1213, Bangladesh");
          if (data.customer.toLowerCase().includes("olivia")) setPhone("+880 1711-482910");
          else if (data.customer.toLowerCase().includes("liam")) setPhone("+880 1822-390124");
          else setPhone("+880 1912-789012");
        }
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="p-8 shadow-xs border-border/80">
          <div className="h-48 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full space-y-4">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="text-sm text-muted-foreground mt-1">No order matches <span className="font-mono">{params.id}</span>.</p>
        </Card>
      </div>
    );
  }

  const isDhaka = address.toLowerCase().includes("dhaka");
  const fraudScore = isDhaka ? 98 : 92;
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
        router.push(`/orders/${order.id}/pack`);
      } else {
        appToast.error("Confirmation Failed", res.message);
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Order {order.id}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Step 1: Order Phone Verification</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Bangladesh Verification Gateway
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Call the customer to verify order intent, confirm doorstep address, and record advance delivery charges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-4 cursor-pointer">
            <Link href={`/orders/${order.id}`}>Cancel</Link>
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirming}
            className="h-11 px-6 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-primary"
          >
            <CheckCircle2 className="h-4 w-4" />
            {confirming ? "Confirming..." : "Confirm & Proceed to Packing Station"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Verification Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steadfast & Pathao Trust Rating Card */}
          <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-foreground">
                  Courier Trust Score &amp; Anti-Fraud Assessment
                </h3>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1">
                {fraudScore}% Delivery Success Rate
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Steadfast and Pathao historical database verifies this phone number has a <strong>clean record with zero return refusals</strong> across 6 prior nationwide courier shipments. Very low return-to-origin (RTO) risk.
            </p>
          </Card>

          {/* Customer Call & Contact Details */}
          <Card className="p-6 border-border/80 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Phone &amp; Shipping Details</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" /> Customer Name
                </label>
                <input
                  type="text"
                  value={order.customer}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-muted/40 px-3 text-sm font-semibold text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number (Verified for Call)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-3 text-xs font-semibold gap-1 text-primary shrink-0"
                    onClick={() => window.open(`tel:${phone.replace(/\D/g, "")}`)}
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Full Delivery Address (Include Area &amp; Thana)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="House, Road, Area, District/Thana..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> Preferred 3PL Courier for this Area
              </label>
              <select
                value={carrierPreference}
                onChange={(e) => setCarrierPreference(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Pathao Courier Express">Pathao Courier (Express 24h Metro Delivery)</option>
                <option value="Steadfast Courier">Steadfast Courier (Nationwide Doorstep COD)</option>
                <option value="RedX Courier">RedX Logistics</option>
                <option value="Paperfly">Paperfly Nationwide</option>
              </select>
            </div>
          </Card>

          {/* Cash on Delivery & Advance Payment */}
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Cash on Delivery &amp; Advance Security</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={hasAdvance}
                  onChange={(e) => {
                    setHasAdvance(e.target.checked);
                    if (e.target.checked && advancePaid === 0) setAdvancePaid(150);
                  }}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                Advance Delivery Fee Received
              </label>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              In Bangladesh e-commerce, taking ৳130–৳150 advance delivery charge via bKash/Nagad for outside Dhaka COD orders prevents parcel rejection losses.
            </p>

            {hasAdvance && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Advance Received Amount (৳)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono font-bold"
                    placeholder="150"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">bKash / Nagad Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    value={advanceTrxId}
                    onChange={(e) => setAdvanceTrxId(e.target.value.toUpperCase())}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono font-bold uppercase"
                    placeholder="BL823901X"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" /> Call &amp; Customer Agreement Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Order Summary & Quick Action */}
        <div className="space-y-6">
          <Card className="p-6 border-border/80 space-y-5 shadow-xs">
            <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Order Financial Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Order Total:</span>
                <span className="font-mono font-bold text-foreground">{order.total}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Items Ordered:</span>
                <span className="font-semibold text-foreground">{order.itemCount} item(s)</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Channel:</span>
                <span className="font-semibold text-foreground">{order.channel}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Advance Deducted:</span>
                <span className="font-mono text-emerald-600 font-semibold">-৳{hasAdvance ? advancePaid : 0}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-foreground">Doorstep COD to Collect:</span>
                <span className="font-mono font-extrabold text-xl text-primary">
                  ৳{codToCollect.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full h-11 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-primary"
            >
              <CheckCircle2 className="h-4 w-4" />
              {confirming ? "Confirming..." : "Confirm & Send to Packing Station"}
            </Button>
          </Card>

          {/* Ordered Line Items Overview */}
          <Card className="p-6 border-border/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Items to Pick from Warehouse
              </h4>
            </div>

            <div className="space-y-2.5">
              {order.lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-foreground truncate">{line.productName}</div>
                    <div className="font-mono text-muted-foreground text-[11px]">{line.sku}</div>
                  </div>
                  <Badge variant="outline" className="font-mono font-bold shrink-0">
                    × {line.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
