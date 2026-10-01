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
  Truck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  MapPin,
  Phone,
  Building2,
  Clock,
  RotateCcw,
  Check,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { useToast, useConfirm } from "@/components/app-feedback";
import { getOrderById, type OrderDetail, type DeliveryStage } from "@/lib/data/orders";
import {
  updateDeliveryMilestone,
  markOrderDelivered,
  markOrderReturned,
} from "@/lib/data/workflows";

export default function OrderDeliveryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appToast = useToast();
  const confirm = useConfirm();

  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [loading, setLoading] = useState(true);

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

  const stage: DeliveryStage = order.deliveryStage || "Handed to Courier";
  const carrierName = order.carrier || "Pathao Courier";
  const cid = order.consignmentId || `PTH-BD-${order.id.replace(/\D/g, "")}`;
  const trackingUrl =
    order.trackingUrl || `https://merchant.pathao.com/tracking?consignment_id=${cid}`;
  const codAmount = order.totalValue;

  const handleUpdateMilestone = (milestone: "In Transit" | "Out for Delivery") => {
    const res = updateDeliveryMilestone(order.id, milestone);
    if (res.ok) {
      appToast.success("Milestone Updated", `Status updated to ${milestone}.`);
      getOrderById(order.id).then(setOrder);
    }
  };

  const handleConfirmDelivery = async () => {
    const allowed = await confirm({
      title: `Confirm Doorstep Delivery for ${order.id}?`,
      description: `Rider collected ৳${codAmount.toLocaleString("en-IN")} Cash on Delivery from ${order.customer}. This reconciles payment as Paid and completes fulfillment.`,
      tone: "default",
      confirmLabel: "Confirm COD & Complete Order",
    });
    if (!allowed) return;

    const res = markOrderDelivered(order.id, order.customer, codAmount);
    if (res.ok) {
      appToast.success("Delivery Completed", `${order.id} delivered and COD settled into financial float.`);
      getOrderById(order.id).then(setOrder);
    }
  };

  const handleMarkReturned = async () => {
    const allowed = await confirm({
      title: `Mark ${order.id} as Return to Origin (RTO)?`,
      description: "Customer rejected delivery or remained unreachable. Inventory will be restocked to warehouse shelf.",
      tone: "destructive",
      confirmLabel: "Confirm Return (RTO)",
    });
    if (!allowed) return;

    const res = markOrderReturned(order.id, order.customer, "Customer unreachable / rejected parcel at doorstep");
    if (res.ok) {
      appToast.error("Order Returned (RTO)", `${order.id} marked as returned and restocked.`);
      getOrderById(order.id).then(setOrder);
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
            <h1 className="text-3xl font-bold tracking-tight">Step 4: Live Delivery Tracking &amp; COD Settlement</h1>
            <Badge
              variant="default"
              className={
                stage === "Delivered"
                  ? "bg-emerald-600 text-white"
                  : stage === "Returned"
                  ? "bg-rose-600 text-white"
                  : "bg-blue-600 text-white"
              }
            >
              {stage}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track courier rider doorstep delivery and reconcile Cash on Delivery (COD) into your ledger upon completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-4 cursor-pointer">
            <Link href={`/orders/${order.id}`}>Back to Order</Link>
          </Button>
          {stage !== "Delivered" && stage !== "Returned" && (
            <>
              <Button
                variant="outline"
                onClick={handleMarkReturned}
                className="h-11 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              >
                Mark Returned (RTO)
              </Button>
              <Button
                onClick={handleConfirmDelivery}
                className="h-11 px-6 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm Delivered &amp; Collect COD
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Courier Live Timeline & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Status Banner */}
          {stage === "Delivered" ? (
            <Card className="p-6 border-emerald-500/30 bg-emerald-500/10 space-y-2 text-center shadow-xs">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h2 className="font-extrabold text-xl text-foreground">Delivery Completed &amp; COD Reconciled!</h2>
              <p className="text-sm text-muted-foreground">
                Doorstep delivery verified. ৳{codAmount.toLocaleString("en-IN")} collected and posted to Courier COD Float.
              </p>
            </Card>
          ) : stage === "Returned" ? (
            <Card className="p-6 border-rose-500/30 bg-rose-500/10 space-y-2 text-center shadow-xs">
              <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
              <h2 className="font-extrabold text-xl text-rose-600">Parcel Returned to Origin (RTO)</h2>
              <p className="text-sm text-muted-foreground">
                Recipient refused or was unreachable after 3 delivery attempts. Inventory restocked to warehouse shelf.
              </p>
            </Card>
          ) : (
            <Card className="p-6 border-blue-500/30 bg-blue-500/5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-base text-foreground">
                    In Transit with {carrierName}
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  {cid}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Courier rider is currently handling last-mile dispatch to{" "}
                <strong className="text-foreground">{order.shippingAddress || "Dhaka, Bangladesh"}</strong>.
              </p>
            </Card>
          )}

          {/* Interactive Delivery Milestones */}
          <Card className="p-6 border-border/80 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Courier Tracking Milestones
              </h2>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Open {carrierName} Portal <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="space-y-4">
              {/* Milestone 1 */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 mt-0.5">
                  <Check className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-foreground">Consignment Booked &amp; Picked Up</div>
                  <div className="text-xs text-muted-foreground">Parcel picked up by {carrierName} rider from Tejgaon Central WH-01.</div>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    stage === "In Transit" || stage === "Out for Delivery" || stage === "Delivered"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {stage === "In Transit" || stage === "Out for Delivery" || stage === "Delivered" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-foreground">Central Sorting Hub Dispatch</div>
                  <div className="text-xs text-muted-foreground">Scanned at courier main logistics sorting facility.</div>
                  {stage === "Handed to Courier" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateMilestone("In Transit")}
                      className="h-8 text-xs font-semibold cursor-pointer"
                    >
                      Advance to In Transit
                    </Button>
                  )}
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    stage === "Out for Delivery" || stage === "Delivered"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {stage === "Out for Delivery" || stage === "Delivered" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "3"
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-foreground">Out for Doorstep Delivery</div>
                  <div className="text-xs text-muted-foreground">Last-mile rider assigned and actively en-route to customer address.</div>
                  {stage === "In Transit" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateMilestone("Out for Delivery")}
                      className="h-8 text-xs font-semibold text-blue-600 cursor-pointer"
                    >
                      Advance to Out for Delivery
                    </Button>
                  )}
                </div>
              </div>

              {/* Milestone 4 */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    stage === "Delivered"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border"
                  }`}
                >
                  {stage === "Delivered" ? <Check className="h-4 w-4" /> : "4"}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-foreground">Delivered &amp; Cash on Delivery Reconciled</div>
                  <div className="text-xs text-muted-foreground">Doorstep handover completed. Cash payment collected and logged into accounts.</div>
                  {stage !== "Delivered" && stage !== "Returned" && (
                    <Button
                      size="sm"
                      onClick={handleConfirmDelivery}
                      className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      Confirm Delivered &amp; Settle COD
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Customer & COD Amount Details */}
        <div className="space-y-6">
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Delivery Destination &amp; Cash
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Customer:</span>
                <span className="font-semibold text-foreground">{order.customer}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Courier Service:</span>
                <span className="font-semibold text-foreground">{carrierName}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Consignment ID:</span>
                <span className="font-mono font-bold text-primary">{cid}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Destination:</span>
                <span className="font-medium text-foreground text-right text-xs max-w-[180px] truncate">
                  {order.shippingAddress || "Dhaka, Bangladesh"}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-foreground">Cash on Delivery (COD):</span>
                <span className="font-mono font-extrabold text-xl text-primary">
                  ৳{codAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {stage !== "Delivered" && stage !== "Returned" && (
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleConfirmDelivery}
                  className="w-full h-11 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirm Delivered &amp; Settle COD
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleMarkReturned}
                  className="w-full h-9 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                >
                  Mark Returned (RTO)
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
