"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Scan,
  CheckCircle2,
  AlertCircle,
  Scale,
  Package,
  Printer,
  Sparkles,
  Barcode,
  Truck,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { getOrderById, type OrderDetail } from "@/lib/data/orders";
import { completeOrderPacking } from "@/lib/data/workflows";

function playScanSound(type: "success" | "error") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Ignore audio errors
  }
}

export default function OrderPackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appToast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [loading, setLoading] = useState(true);

  // Scan Station State
  const [scannedMap, setScannedMap] = useState<Record<string, number>>({});
  const [barcodeInput, setBarcodeInput] = useState("");
  const [packageWeight, setPackageWeight] = useState("0.75");
  const [packagingType, setPackagingType] = useState("Tamper-Proof Courier Polybag");
  const [showStickerPreview, setShowStickerPreview] = useState(true);

  useEffect(() => {
    let alive = true;
    getOrderById(params.id).then((data) => {
      if (alive) {
        setOrder(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

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
        </Card>
      </div>
    );
  }

  const totalRequiredCount = order.lines.reduce((acc, line) => acc + line.quantity, 0);
  const totalScannedCount = Object.values(scannedMap).reduce((acc, count) => acc + count, 0);
  const isFullyScanned = totalScannedCount >= totalRequiredCount && totalRequiredCount > 0;

  const handleScanCode = (codeToScan: string) => {
    const raw = codeToScan.trim().toUpperCase();
    if (!raw) return;

    const matchedLine = order.lines.find(
      (line) =>
        line.sku.toUpperCase() === raw ||
        line.sku.toUpperCase().includes(raw) ||
        raw.includes(line.sku.toUpperCase())
    );

    if (!matchedLine) {
      playScanSound("error");
      appToast.error("Barcode Mismatch", `Scanned code "${raw}" is not in order ${order.id}.`);
      setBarcodeInput("");
      return;
    }

    const currentCount = scannedMap[matchedLine.sku] || 0;
    if (currentCount >= matchedLine.quantity) {
      playScanSound("error");
      appToast.error(
        "Item Already Verified",
        `All ${matchedLine.quantity} unit(s) of "${matchedLine.sku}" are already scanned.`
      );
      setBarcodeInput("");
      return;
    }

    playScanSound("success");
    setScannedMap((prev) => ({
      ...prev,
      [matchedLine.sku]: currentCount + 1,
    }));
    appToast.success(
      "Item Verified ✓",
      `Verified "${matchedLine.productName}" (${currentCount + 1}/${matchedLine.quantity})`
    );
    setBarcodeInput("");
  };

  const handleScanAllQuick = () => {
    const fullMap: Record<string, number> = {};
    for (const line of order.lines) {
      fullMap[line.sku] = line.quantity;
    }
    setScannedMap(fullMap);
    playScanSound("success");
    appToast.success("All Items Verified", `Auto-scanned ${totalRequiredCount} items successfully.`);
  };

  const handleCompletePacking = () => {
    if (!isFullyScanned) {
      appToast.error("Incomplete Packing", "All order items must be scanned and verified before sealing.");
      return;
    }

    const res = completeOrderPacking(order.id, order.customer, {
      scannedItemsCount: totalScannedCount,
      totalItemsCount: totalRequiredCount,
      packageWeightKg: Number(packageWeight) || 0.75,
      packagingType,
    });

    if (res.ok) {
      appToast.success("Packing Complete", `Order ${order.id} packed & weighed (${packageWeight}kg). Routing to courier dispatch.`);
      router.push(`/orders/${order.id}/dispatch`);
    } else {
      appToast.error("Packing Failed", res.message);
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
            <h1 className="text-3xl font-bold tracking-tight">Step 2: Barcode Packing Station</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Warehouse Pack &amp; Weigh
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Scan physical barcodes for all pick-list items to eliminate wrong-product delivery errors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-4 cursor-pointer">
            <Link href={`/orders/${order.id}`}>Cancel</Link>
          </Button>
          <Button
            onClick={handleCompletePacking}
            disabled={!isFullyScanned}
            className={`h-11 px-6 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all ${
              isFullyScanned ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isFullyScanned ? "Complete Packing & Shift to Courier" : `Scan Items (${totalScannedCount}/${totalRequiredCount})`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Live Barcode Scanner & Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner Input Box */}
          <Card className="p-6 border-2 border-dashed border-primary/40 bg-primary/5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Barcode className="h-5 w-5" /> Live Barcode Scanner Input
              </label>
              <Badge variant="outline" className="font-mono text-xs">
                {totalScannedCount} / {totalRequiredCount} Verified
              </Badge>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanCode(barcodeInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode or type SKU (e.g. ACC-HUB-100W) & press Enter..."
                className="h-12 flex-1 rounded-md border border-input bg-background px-4 font-mono text-base font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
              <Button type="submit" className="h-12 px-6 cursor-pointer font-semibold gap-2">
                <Scan className="h-4 w-4" /> Verify Code
              </Button>
            </form>

            {/* Quick Demo Simulator Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-primary/20">
              <span className="text-xs text-muted-foreground mr-1">Fast Simulator Chips:</span>
              {order.lines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => handleScanCode(line.sku)}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-card border border-border/80 hover:border-primary hover:bg-primary/10 text-foreground cursor-pointer transition-colors shadow-2xs"
                >
                  Scan {line.sku}
                </button>
              ))}
              <button
                type="button"
                onClick={handleScanAllQuick}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer transition-colors"
              >
                Scan All (Auto)
              </button>
            </div>
          </Card>

          {/* Line Items Checklist */}
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Pick-List Verification Checklist
              </h2>
              <span className="text-xs text-muted-foreground">Audio confirmation enabled</span>
            </div>

            <div className="space-y-3">
              {order.lines.map((line) => {
                const scanned = scannedMap[line.sku] || 0;
                const done = scanned >= line.quantity;
                return (
                  <div
                    key={line.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/80 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="text-sm font-bold text-foreground flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{line.productName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono font-semibold bg-muted px-2 py-0.5 rounded">{line.sku}</span>
                        {line.variant && <span>Variant: {line.variant}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant={done ? "default" : "outline"}
                        className={`font-mono text-xs px-3 py-1 font-bold ${
                          done ? "bg-emerald-600 text-white" : ""
                        }`}
                      >
                        {scanned} / {line.quantity} Scanned
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Parcel Weight & Packaging */}
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 pb-2 border-b">
              <Scale className="h-5 w-5 text-primary" /> Parcel Gross Weight &amp; Seal
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-primary" /> Package Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground">Used for Pathao / Steadfast courier billing.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-primary" /> Security Packaging Type
                </label>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Tamper-Proof Courier Polybag">Tamper-Proof Courier Polybag</option>
                  <option value="3-Ply Corrugated Box">3-Ply Corrugated Box</option>
                  <option value="Bubble Wrap + Heavy Box">Bubble Wrap + Heavy Box (Fragile)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Thermal Shipping Label Sticker Preview */}
        <div className="space-y-6">
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Printer className="h-4 w-4" /> 4x6" Thermal AWB Sticker
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Label
              </Button>
            </div>

            {/* Realistic 4x6" Courier Label */}
            <div className="p-5 rounded-lg border-2 border-border/90 bg-card text-foreground font-sans space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-extrabold text-base tracking-tight">VOLTMART LOGISTICS</div>
                  <div className="text-[10px] text-muted-foreground font-mono">HUB: TEJGAON-WH01</div>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold bg-primary/10 text-primary">
                  PATHAO EXPRESS
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Consignment</div>
                  <div className="text-base font-mono font-bold text-foreground">
                    PTH-BD-{order.id.replace(/\D/g, "")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">COD Amount</div>
                  <div className="text-lg font-mono font-extrabold text-primary">
                    ৳{order.totalValue.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="border-t border-b py-2.5 space-y-1 text-xs">
                <div>
                  <span className="font-bold text-muted-foreground">DELIVER TO:</span>{" "}
                  <span className="font-bold">{order.customer}</span>
                </div>
                <div className="text-muted-foreground leading-snug">
                  {order.shippingAddress || "House 42, Road 11, Banani, Dhaka 1213"}
                </div>
                <div className="font-mono text-muted-foreground font-semibold pt-0.5">
                  TEL: +880 1711-482910
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Weight: <strong>{packageWeight} kg</strong></span>
                <span>Items: <strong>{totalRequiredCount} pcs</strong></span>
                <span className="font-mono font-bold">{order.id}</span>
              </div>
            </div>

            <Button
              onClick={handleCompletePacking}
              disabled={!isFullyScanned}
              className={`w-full h-11 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all ${
                isFullyScanned ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isFullyScanned ? "Seal Parcel & Shift to Courier" : `Scan All Items (${totalScannedCount}/${totalRequiredCount})`}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
