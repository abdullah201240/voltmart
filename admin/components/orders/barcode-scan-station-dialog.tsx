"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Scan,
  CheckCircle2,
  AlertCircle,
  Scale,
  Package,
  Printer,
  Sparkles,
  Barcode,
  QrCode,
  Truck,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { completeOrderPacking } from "@/lib/data/workflows";
import type { OrderDetail, OrderLine } from "@/lib/data/orders";

interface BarcodeScanStationDialogProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Simple Web Audio API haptic / sound synthesizer
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
    // Ignore audio failures if browser blocks autoplay
  }
}

export function BarcodeScanStationDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: BarcodeScanStationDialogProps) {
  const appToast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Scanned quantities per line item SKU
  const [scannedMap, setScannedMap] = useState<Record<string, number>>({});
  const [barcodeInput, setBarcodeInput] = useState("");
  const [packageWeight, setPackageWeight] = useState("0.75");
  const [packagingType, setPackagingType] = useState("Tamper-Proof Courier Polybag");
  const [lastScannedSku, setLastScannedSku] = useState<string | null>(null);
  const [showStickerPreview, setShowStickerPreview] = useState(false);

  // Total items in order
  const totalRequiredCount = order.lines.reduce((acc, line) => acc + line.quantity, 0);
  const totalScannedCount = Object.values(scannedMap).reduce((acc, count) => acc + count, 0);
  const isFullyScanned = totalScannedCount >= totalRequiredCount && totalRequiredCount > 0;

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleScanCode = (codeToScan: string) => {
    const raw = codeToScan.trim().toUpperCase();
    if (!raw) return;

    // Find line item matching SKU or product code
    const matchedLine = order.lines.find(
      (line) =>
        line.sku.toUpperCase() === raw ||
        line.sku.toUpperCase().includes(raw) ||
        raw.includes(line.sku.toUpperCase())
    );

    if (!matchedLine) {
      playScanSound("error");
      appToast.error("Barcode Mismatch", `Scanned "${raw}" does not belong to order ${order.id}.`);
      setBarcodeInput("");
      return;
    }

    const currentCount = scannedMap[matchedLine.sku] || 0;
    if (currentCount >= matchedLine.quantity) {
      playScanSound("error");
      appToast.error(
        "Already Scanned",
        `All ${matchedLine.quantity} unit(s) of "${matchedLine.sku}" are already verified.`
      );
      setBarcodeInput("");
      return;
    }

    // Success scan
    playScanSound("success");
    setScannedMap((prev) => ({
      ...prev,
      [matchedLine.sku]: currentCount + 1,
    }));
    setLastScannedSku(matchedLine.sku);
    appToast.success(
      "Item Verified ✓",
      `Scanned "${matchedLine.productName}" (${currentCount + 1}/${matchedLine.quantity})`
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
      appToast.error("Incomplete Packing", "All order items must be scanned and verified before sealing the parcel.");
      return;
    }

    const res = completeOrderPacking(order.id, order.customer, {
      scannedItemsCount: totalScannedCount,
      totalItemsCount: totalRequiredCount,
      packageWeightKg: Number(packageWeight) || 0.75,
      packagingType,
    });

    if (res.ok) {
      appToast.success("Packing Complete", `Order ${order.id} packed & weighed (${packageWeight}kg). Ready for courier handover.`);
      onSuccess();
      onOpenChange(false);
    } else {
      appToast.error("Packing Failed", res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl font-bold">
                Pick &amp; Pack Barcode Scan Station
              </DialogTitle>
            </div>
            <Badge
              variant={isFullyScanned ? "default" : "outline"}
              className={isFullyScanned ? "bg-emerald-600 text-white" : "text-xs font-mono"}
            >
              {totalScannedCount} / {totalRequiredCount} Items Scanned
            </Badge>
          </div>
          <DialogDescription>
            Scan physical product barcodes or SKUs before sealing the courier parcel for order{" "}
            <span className="font-mono font-semibold text-foreground">{order.id}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/60">
            <div
              className="bg-primary h-2 transition-all duration-300"
              style={{
                width: `${totalRequiredCount > 0 ? (totalScannedCount / totalRequiredCount) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Barcode Scanner Input */}
          <div className="p-4 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Barcode className="h-4 w-4" /> Live Barcode Scanner Input
              </label>
              <span className="text-[11px] text-muted-foreground">
                Plug in USB scanner or type SKU and hit Enter
              </span>
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
                placeholder="Scan barcode or SKU (e.g. ACC-HUB-100W)..."
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="h-10 px-4 cursor-pointer font-semibold gap-1.5">
                <Scan className="h-4 w-4" /> Verify Scan
              </Button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Fast Simulator:</span>
              {order.lines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => handleScanCode(line.sku)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-card border border-border/80 hover:border-primary/60 hover:bg-primary/10 text-foreground cursor-pointer transition-colors"
                >
                  Scan {line.sku}
                </button>
              ))}
              <button
                type="button"
                onClick={handleScanAllQuick}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer transition-colors"
              >
                Scan All (Auto)
              </button>
            </div>
          </div>

          {/* Line Items Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Required Items Checklist
            </span>
            <div className="space-y-2">
              {order.lines.map((line) => {
                const scanned = scannedMap[line.sku] || 0;
                const done = scanned >= line.quantity;
                return (
                  <div
                    key={line.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/80 bg-card"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{line.productName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{line.sku}</span>
                        {line.variant && <span>· {line.variant}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant={done ? "default" : "outline"}
                        className={`font-mono text-xs ${done ? "bg-emerald-600 text-white" : ""}`}
                      >
                        {scanned} / {line.quantity} Verified
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Packaging & Weight Details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-primary" /> Parcel Gross Weight (kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={packageWeight}
                onChange={(e) => setPackageWeight(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0.75"
              />
              <p className="text-[11px] text-muted-foreground">Weighed on warehouse digital scale.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-primary" /> Packaging Material
              </label>
              <select
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Tamper-Proof Courier Polybag">Tamper-Proof Courier Polybag</option>
                <option value="3-Ply Corrugated Box">3-Ply Corrugated Box</option>
                <option value="Bubble Wrap + Heavy Box">Bubble Wrap + Heavy Box (Fragile)</option>
              </select>
            </div>
          </div>

          {/* Printable Courier AWB Shipping Sticker Preview Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowStickerPreview(!showStickerPreview)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              {showStickerPreview ? "Hide Thermal Shipping Label" : "Preview 4x6\" Thermal Shipping Label Sticker"}
            </button>

            {showStickerPreview && (
              <div className="mt-3 p-4 rounded-lg border border-border/90 bg-card text-foreground font-sans space-y-3 shadow-sm max-w-md mx-auto">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-extrabold text-sm tracking-tight">VOLTMART LOGISTICS</div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    PATHAO EXPRESS
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[11px] text-muted-foreground uppercase font-semibold">Consignment</div>
                    <div className="text-sm font-mono font-bold">PTH-BD-{order.id.replace(/\D/g, "")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground uppercase font-semibold">COD Collection</div>
                    <div className="text-base font-mono font-extrabold text-primary">
                      ৳{order.totalValue.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="border-t border-b py-2 space-y-1 text-xs">
                  <div>
                    <span className="font-bold text-muted-foreground">SHIP TO:</span>{" "}
                    <span className="font-semibold">{order.customer}</span>
                  </div>
                  <div className="text-muted-foreground">{order.shippingAddress || "Dhaka, Bangladesh"}</div>
                  <div className="font-mono text-muted-foreground">+880 1711-482910</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Gross: {packageWeight} kg</span>
                  <span>Items: {totalRequiredCount} pcs</span>
                  <span className="font-mono">{order.id}</span>
                </div>
              </div>
            )}
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
            onClick={handleCompletePacking}
            disabled={!isFullyScanned}
            className={`cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5 ${
              isFullyScanned ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isFullyScanned ? "Complete Packing & Seal Box" : `Scan All Items (${totalScannedCount}/${totalRequiredCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
