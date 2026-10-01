"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  CheckCircle2,
  Scan,
  Package,
  Truck,
  MapPin,
  ExternalLink,
  RotateCcw,
  Check,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Barcode,
} from "lucide-react";
import { useToast, useConfirm } from "@/components/app-feedback";
import {
  updateDeliveryMilestone,
  markOrderDelivered,
  markOrderReturned,
} from "@/lib/data/workflows";
import type { OrderDetail, DeliveryStage } from "@/lib/data/orders";
import { OrderConfirmationDialog } from "./order-confirmation-dialog";
import { BarcodeScanStationDialog } from "./barcode-scan-station-dialog";
import { CourierDispatchDialog } from "./courier-dispatch-dialog";

interface BangladeshFulfillmentStepperProps {
  order: OrderDetail;
  onRefresh: () => void;
}

interface StepItem {
  id: DeliveryStage;
  label: string;
  bnLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: (id: string) => string;
}

const FULFILLMENT_STEPS: StepItem[] = [
  {
    id: "Pending Confirmation",
    label: "1. Phone Verification",
    bnLabel: "ফোন ভেরিফিকেশন",
    icon: PhoneCall,
    description: "Customer verification, fraud risk check & address validation",
    href: (id) => `/orders/${id}/confirm`,
  },
  {
    id: "Confirmed",
    label: "2. Confirmed",
    bnLabel: "অর্ডার কনফার্মড",
    icon: CheckCircle2,
    description: "Stock allocated from warehouse, queued for picking",
    href: (id) => `/orders/${id}/confirm`,
  },
  {
    id: "Packed",
    label: "3. Pack & Barcode Scan",
    bnLabel: "প্যাকিং ও স্ক্যান",
    icon: Scan,
    description: "SKU barcode scanning verification, gross weight & parcel label",
    href: (id) => `/orders/${id}/pack`,
  },
  {
    id: "Handed to Courier",
    label: "4. Shift to Courier",
    bnLabel: "কুরিয়ারে শিফট",
    icon: Truck,
    description: "Pathao / Steadfast 3PL consignment booking & manifest handover",
    href: (id) => `/orders/${id}/dispatch`,
  },
  {
    id: "Delivered",
    label: "5. Delivered & COD",
    bnLabel: "ডেলিভারি ও ক্যাশ",
    icon: DollarSign,
    description: "Doorstep delivery, Cash on Delivery collection & ledger settlement",
    href: (id) => `/orders/${id}/delivery`,
  },
];

export function BangladeshFulfillmentStepper({
  order,
  onRefresh,
}: BangladeshFulfillmentStepperProps) {
  const appToast = useToast();
  const confirm = useConfirm();

  // Active dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);

  // Derive current effective delivery stage
  let stage: DeliveryStage = order.deliveryStage || "Pending Confirmation";
  if (!order.deliveryStage) {
    if (order.status === "Quotation") stage = "Pending Confirmation";
    else if (order.status === "Confirmed") stage = "Confirmed";
    else if (order.status === "Fulfilled") stage = "Handed to Courier";
    else if (order.status === "Invoiced") stage = "Delivered";
    else if (order.status === "Cancelled") stage = "Returned";
  }

  // Find step index in standard flow
  const currentStepIndex =
    stage === "Pending Confirmation"
      ? 0
      : stage === "Confirmed"
      ? 1
      : stage === "Packing" || stage === "Packed"
      ? 2
      : stage === "Handed to Courier" || stage === "In Transit" || stage === "Out for Delivery"
      ? 3
      : stage === "Delivered"
      ? 4
      : -1;

  const handleUpdateMilestone = (milestone: "In Transit" | "Out for Delivery") => {
    const res = updateDeliveryMilestone(order.id, milestone);
    if (res.ok) {
      appToast.success("Courier Updated", `${order.id} status changed to ${milestone}.`);
      onRefresh();
    }
  };

  const handleCompleteDelivery = async () => {
    const allowed = await confirm({
      title: `Confirm Delivery for ${order.id}?`,
      description: `Rider collected ৳${order.totalValue.toLocaleString("en-IN")} COD from ${order.customer}. This will mark the order as Delivered and Paid.`,
      tone: "default",
      confirmLabel: "Confirm COD & Deliver",
    });
    if (!allowed) return;

    const res = markOrderDelivered(order.id, order.customer, order.totalValue);
    if (res.ok) {
      appToast.success("Delivery Completed", `${order.id} delivered and COD recorded.`);
      onRefresh();
    }
  };

  const handleMarkReturned = async () => {
    const allowed = await confirm({
      title: `Mark ${order.id} as Return to Origin (RTO)?`,
      description: "Customer refused delivery or remained unreachable. Items will be restocked to warehouse inventory.",
      tone: "destructive",
      confirmLabel: "Confirm Courier Return",
    });
    if (!allowed) return;

    const res = markOrderReturned(order.id, order.customer, "Customer unreachable after 3 delivery attempts");
    if (res.ok) {
      appToast.error("Order Returned (RTO)", `${order.id} marked as returned and restocked.`);
      onRefresh();
    }
  };

  return (
    <>
      <Card className="p-5 sm:p-6 shadow-xs border-border/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bangladesh E-Commerce Delivery Pipeline
              </span>
              <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20">
                End-to-End Fulfillment
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Lifecycle: Pending Verification → Confirmation → Barcode Scan &amp; Packing → 3PL Courier Handover → Doorstep COD Delivery.
            </div>
          </div>

          {/* Current Stage Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Stage:</span>
            <Badge
              variant="default"
              className={cn(
                "text-xs font-semibold px-2.5 py-0.5",
                stage === "Delivered"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : stage === "Returned"
                  ? "bg-rose-600 text-white"
                  : stage === "Handed to Courier" || stage === "In Transit" || stage === "Out for Delivery"
                  ? "bg-blue-600 text-white"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {stage}
            </Badge>
          </div>
        </div>

        {/* 5-Step Visual Stepper - Clicking any step opens its dedicated full page */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-3">
          {FULFILLMENT_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx || stage === "Delivered";
            const isCurrent = currentStepIndex === idx && stage !== "Delivered";
            const Icon = step.icon;

            return (
              <Link
                key={step.id}
                href={step.href(order.id)}
                className={cn(
                  "group flex flex-col p-3 rounded-lg border transition-all duration-200 relative cursor-pointer hover:border-primary/60 hover:shadow-xs",
                  isCurrent
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                    : "border-border/60 bg-muted/20 opacity-80"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="text-[10px] hidden group-hover:inline font-medium">Page ↗</span>
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isCurrent
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                </div>

                <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                  {step.label}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">{step.bnLabel}</div>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                  {step.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Dynamic Contextual Action Bar based on current stage */}
        <div className="p-4 rounded-lg border border-border/80 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stage 1: Pending Confirmation */}
          {stage === "Pending Confirmation" && (
            <>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-primary" /> Step 1: Verification Required
                </div>
                <div className="text-xs text-muted-foreground">
                  Call recipient to verify phone number, address, and COD acceptance before packing.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  className="cursor-pointer text-xs"
                >
                  Quick Call Dialog
                </Button>
                <Button
                  asChild
                  className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5 bg-primary text-primary-foreground"
                >
                  <Link href={`/orders/${order.id}/confirm`}>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Open Phone Verification Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* Stage 2: Confirmed -> Ready to Pack */}
          {stage === "Confirmed" && (
            <>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Step 2: Confirmed &amp; Ready for Warehouse Picking
                </div>
                <div className="text-xs text-muted-foreground">
                  Stock is allocated. Open the dedicated packing terminal to scan item barcodes, weigh parcel, and print 4x6&quot; thermal label.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPackOpen(true)}
                  className="cursor-pointer text-xs"
                >
                  Quick Scan Dialog
                </Button>
                <Button
                  asChild
                  className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5 bg-primary text-primary-foreground"
                >
                  <Link href={`/orders/${order.id}/pack`}>
                    <Barcode className="h-4 w-4" />
                    <span>Open Packing Station Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* Stage 3: Packing / Packed -> Ready for Courier */}
          {(stage === "Packing" || stage === "Packed") && (
            <>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Step 3: Packing Verified (Gross Weight: {order.packageWeightKg || 0.75}kg)
                </div>
                <div className="text-xs text-muted-foreground">
                  All items scanned with 0 errors. Ready to book 3PL consignment with Pathao or Steadfast Courier.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs"
                >
                  <Link href={`/orders/${order.id}/pack`}>
                    <Scan className="mr-1.5 h-3.5 w-3.5" /> Re-Scan Station
                  </Link>
                </Button>
                <Button
                  asChild
                  className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/orders/${order.id}/dispatch`}>
                    <Truck className="h-4 w-4" />
                    <span>Open Courier Dispatch Page</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* Stage 4: Handed to Courier / In Transit / Out for Delivery */}
          {(stage === "Handed to Courier" || stage === "In Transit" || stage === "Out for Delivery") && (
            <>
              <div className="space-y-1">
                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Dispatched via {order.carrier || "Pathao Courier"}</span>
                  {order.consignmentId && (
                    <Badge variant="outline" className="font-mono text-xs font-bold">
                      {order.consignmentId}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>COD Collection: <strong className="text-foreground">৳{order.totalValue.toLocaleString("en-IN")}</strong></span>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      Courier Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs font-semibold text-primary"
                >
                  <Link href={`/orders/${order.id}/delivery`}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open Tracking &amp; COD Page
                  </Link>
                </Button>
                {stage === "Handed to Courier" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateMilestone("In Transit")}
                    className="cursor-pointer text-xs font-semibold"
                  >
                    Mark In Transit
                  </Button>
                )}
                {stage === "In Transit" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateMilestone("Out for Delivery")}
                    className="cursor-pointer text-xs font-semibold text-blue-600"
                  >
                    Mark Out for Delivery
                  </Button>
                )}
                <Button
                  onClick={handleCompleteDelivery}
                  className="cursor-pointer active:scale-[0.98] transition-all font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirm Delivered &amp; Collect COD
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkReturned}
                  className="cursor-pointer text-rose-600 hover:bg-rose-500/10 text-xs"
                >
                  Mark Returned (RTO)
                </Button>
              </div>
            </>
          )}

          {/* Stage 5: Delivered */}
          {stage === "Delivered" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-600 dark:text-emerald-400">Order Completed &amp; Delivered.</strong> Cash on Delivery (৳{order.totalValue.toLocaleString("en-IN")}) collected and reconciled into VoltMart finance float.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="cursor-pointer text-xs">
                  <Link href={`/orders/${order.id}/delivery`}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Delivery Audit Page
                  </Link>
                </Button>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold">
                  100% Fulfilled
                </Badge>
              </div>
            </div>
          )}

          {/* Stage: Returned */}
          {stage === "Returned" && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-xs text-rose-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Parcel Returned to Origin (RTO).</strong> Customer refused delivery or remained unreachable. Inventory restocked to warehouse shelf.
                </div>
              </div>
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-xs font-bold">
                Returned
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Interactive Modals */}
      <OrderConfirmationDialog
        order={order}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onSuccess={onRefresh}
      />

      <BarcodeScanStationDialog
        order={order}
        open={packOpen}
        onOpenChange={setPackOpen}
        onSuccess={onRefresh}
      />

      <CourierDispatchDialog
        order={order}
        open={dispatchOpen}
        onOpenChange={setDispatchOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
