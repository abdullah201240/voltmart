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
  Truck,
  CheckCircle2,
  PackageCheck,
  Printer,
  Barcode,
  Building2,
  FileSignature,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { fulfillOrderWithCourierAction } from "@/app/actions/orders";
import { dispatchOrderToCourier } from "@/lib/data/workflows";
import type { OrderDetail } from "@/lib/data/orders";

interface CourierDispatchDialogProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CourierDispatchDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: CourierDispatchDialogProps) {
  const appToast = useToast();
  const [carrier, setCarrier] = useState<"pathao" | "steadfast">("pathao");
  const [pickupHub, setPickupHub] = useState("VoltMart Tejgaon Central WH-01 (Dhaka)");
  const [deliverySpeed, setDeliverySpeed] = useState<"24h" | "48h">("24h");
  const [deliveryNotes, setDeliveryNotes] = useState("Handle with care - Electronics. Call recipient before delivery.");
  const [booking, setBooking] = useState(false);
  const [dispatchedResult, setDispatchedResult] = useState<{
    consignmentId: string;
    trackingUrl: string;
    carrierName: string;
  } | null>(null);

  const isDhaka = (order.shippingAddress || "").toLowerCase().includes("dhaka");
  const estimatedDeliveryFee = isDhaka ? 60 : 130;
  const codAmount = order.paymentStatus === "Paid" ? 0 : order.totalValue;

  const handleDispatch = async () => {
    setBooking(true);
    try {
      const res = await fulfillOrderWithCourierAction({
        orderId: order.id,
        carrier,
        recipientName: order.customer,
        recipientPhone: "+880 1711-482910",
        recipientAddress: order.shippingAddress || "Dhaka, Bangladesh",
        recipientCity: isDhaka ? "Dhaka" : "Chattogram",
        amountToCollect: codAmount,
        totalWeightKg: order.packageWeightKg || 0.75,
        orderNumber: order.id,
      });

      if (!res.success) {
        appToast.error("Courier Booking Error", res.error || "Failed to book courier consignment.");
        return;
      }

      const carrierName = res.carrier || (carrier === "pathao" ? "Pathao Courier" : "Steadfast Courier");
      const cid = res.consignmentId || `CID-BD-${Date.now().toString().slice(-6)}`;
      const track = res.trackingUrl || `https://merchant.pathao.com/tracking?consignment_id=${cid}`;

      dispatchOrderToCourier(order.id, order.customer, {
        carrier: carrierName,
        consignmentId: cid,
        trackingUrl: track,
        codAmount,
      });

      setDispatchedResult({
        consignmentId: cid,
        trackingUrl: track,
        carrierName,
      });

      appToast.success(
        "Handed to Courier",
        `Consignment #${res.consignmentId} booked with ${res.carrier}. Dispatch manifest generated.`
      );
      onSuccess();
    } finally {
      setBooking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold">
              Shift to 3PL Courier (Dispatch &amp; Handover)
            </DialogTitle>
          </div>
          <DialogDescription>
            Book delivery consignment with Pathao or Steadfast Courier and generate the rider handover manifest for order{" "}
            <span className="font-mono font-semibold text-foreground">{order.id}</span>.
          </DialogDescription>
        </DialogHeader>

        {!dispatchedResult ? (
          <div className="space-y-4 py-2">
            {/* Courier Selection Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Select 3PL Courier Partner</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCarrier("pathao")}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    carrier === "pathao"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">Pathao Courier</span>
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20">
                      Express
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best for same-day &amp; next-day delivery in Dhaka Metro &amp; major cities.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCarrier("steadfast")}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    carrier === "steadfast"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">Steadfast Courier</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Nationwide
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct doorstep COD coverage across all 64 districts &amp; 495 upazilas.
                  </p>
                </button>
              </div>
            </div>

            {/* Warehouse Pickup & Service */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Warehouse Pickup Hub
                </label>
                <select
                  value={pickupHub}
                  onChange={(e) => setPickupHub(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="VoltMart Tejgaon Central WH-01 (Dhaka)">Tejgaon Central WH-01 (Dhaka)</option>
                  <option value="VoltMart Chattogram Hub (Agrabad)">Chattogram Hub (Agrabad)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Delivery Type
                </label>
                <select
                  value={deliverySpeed}
                  onChange={(e) => setDeliverySpeed(e.target.value as "24h" | "48h")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="24h">24h Express Delivery</option>
                  <option value="48h">48h Standard Delivery</option>
                </select>
              </div>
            </div>

            {/* Consignment Financial Summary */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Recipient Name:</span>
                <span className="font-semibold text-foreground">{order.customer}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium text-foreground">{order.shippingAddress || "Dhaka, Bangladesh"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated Courier Charge:</span>
                <span className="font-mono font-medium text-foreground">৳{estimatedDeliveryFee}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">COD Amount Rider Must Collect:</span>
                <span className="font-mono font-extrabold text-sm text-primary">
                  ৳{codAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Special Instructions for Courier Rider */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Special Instructions for Rider</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Call before delivery, handle fragile electronics..."
              />
            </div>
          </div>
        ) : (
          /* Dispatched Success & Manifest View */
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="font-bold text-base text-foreground">Consignment Booked &amp; Shifted to Courier!</div>
              <p className="text-xs text-muted-foreground">
                Order <span className="font-mono font-semibold text-foreground">{order.id}</span> has been dispatched to{" "}
                <span className="font-semibold text-foreground">{dispatchedResult.carrierName}</span>.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border/80 bg-card space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consignment ID:</span>
                <span className="font-mono font-bold text-sm text-primary">{dispatchedResult.consignmentId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Courier Service:</span>
                <span className="font-semibold">{dispatchedResult.carrierName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Live Tracking:</span>
                <a
                  href={dispatchedResult.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  Open Courier Portal <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Courier Dispatch Manifest Handover Card */}
            <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <FileSignature className="h-4 w-4 text-primary" /> Courier Handover Manifest Sheet
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Ready for courier rider signature upon parcel handover.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Manifest
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!dispatchedResult ? (
            <>
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
                onClick={handleDispatch}
                disabled={booking}
                className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5"
              >
                <PackageCheck className="h-4 w-4" />
                {booking ? "Booking Courier..." : "Shift to Courier & Book Consignment"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-semibold"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
