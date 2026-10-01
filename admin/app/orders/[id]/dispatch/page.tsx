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
  PackageCheck,
  Printer,
  Building2,
  FileSignature,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Banknote,
} from "lucide-react";
import { useToast } from "@/components/app-feedback";
import { getOrderById, type OrderDetail } from "@/lib/data/orders";
import { fulfillOrderWithCourierAction } from "@/app/actions/orders";
import { dispatchOrderToCourier } from "@/lib/data/workflows";

export default function OrderDispatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appToast = useToast();

  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [loading, setLoading] = useState(true);

  // Dispatch Form State
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

  useEffect(() => {
    let alive = true;
    getOrderById(params.id).then((data) => {
      if (alive) {
        setOrder(data);
        if (data?.consignmentId) {
          setDispatchedResult({
            consignmentId: data.consignmentId,
            trackingUrl: data.trackingUrl || `https://merchant.pathao.com/tracking?consignment_id=${data.consignmentId}`,
            carrierName: data.carrier || "Pathao Courier",
          });
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
        </Card>
      </div>
    );
  }

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
        `Consignment #${cid} booked with ${carrierName}. Manifest generated.`
      );
    } finally {
      setBooking(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Step 3: Courier Dispatch &amp; Handover</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              3PL Logistics Gateway
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate courier API consignments for Pathao or Steadfast and prepare the courier pickup handover sheet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-4 cursor-pointer">
            <Link href={`/orders/${order.id}`}>Back</Link>
          </Button>
          {dispatchedResult ? (
            <Button
              asChild
              className="h-11 px-6 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href={`/orders/${order.id}/delivery`}>
                <CheckCircle2 className="h-4 w-4" /> Go to Live Delivery Tracking <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleDispatch}
              disabled={booking}
              className="h-11 px-6 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PackageCheck className="h-4 w-4" />
              {booking ? "Booking Consignment..." : "Book Consignment & Shift to Courier"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Courier Partner Selection */}
        <div className="lg:col-span-2 space-y-6">
          {!dispatchedResult ? (
            <>
              {/* Courier Selection Cards */}
              <Card className="p-6 border-border/80 space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2 pb-2 border-b">
                  <Truck className="h-5 w-5 text-primary" /> Select 3PL Courier Partner
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCarrier("pathao")}
                    className={`p-5 rounded-lg border text-left cursor-pointer transition-all ${
                      carrier === "pathao"
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/80 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-foreground">Pathao Courier</span>
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20 font-bold">
                        Express 24h
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Recommended for Dhaka Metro &amp; Divisional cities. Fastest delivery speed with real-time GPS tracking.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCarrier("steadfast")}
                    className={`p-5 rounded-lg border text-left cursor-pointer transition-all ${
                      carrier === "steadfast"
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/80 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-foreground">Steadfast Courier</span>
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                        Nationwide COD
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Deepest rural coverage across all 64 districts &amp; 495 upazilas with next-day doorstep COD collection.
                    </p>
                  </button>
                </div>
              </Card>

              {/* Warehouse Hub & Shipping Specs */}
              <Card className="p-6 border-border/80 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5 text-primary" /> Warehouse Pickup Hub &amp; Speed
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Warehouse Hub for Rider Pickup
                    </label>
                    <select
                      value={pickupHub}
                      onChange={(e) => setPickupHub(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="VoltMart Tejgaon Central WH-01 (Dhaka)">VoltMart Tejgaon Central WH-01 (Dhaka)</option>
                      <option value="VoltMart Chattogram Hub (Agrabad)">VoltMart Chattogram Hub (Agrabad)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Delivery Transit Speed
                    </label>
                    <select
                      value={deliverySpeed}
                      onChange={(e) => setDeliverySpeed(e.target.value as "24h" | "48h")}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="24h">24 Hours Priority Express</option>
                      <option value="48h">48 Hours Standard Delivery</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-foreground">Delivery Instructions for Courier Rider</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </Card>
            </>
          ) : (
            /* Dispatched Success & Handover Manifest */
            <div className="space-y-6">
              <Card className="p-6 border-emerald-500/30 bg-emerald-500/10 space-y-3 text-center shadow-xs">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h2 className="font-extrabold text-xl text-foreground">Consignment Booked &amp; Shifted to Courier!</h2>
                <p className="text-sm text-muted-foreground">
                  Order <span className="font-mono font-bold text-foreground">{order.id}</span> has been dispatched to{" "}
                  <strong className="text-foreground">{dispatchedResult.carrierName}</strong>.
                </p>
              </Card>

              {/* Printable Courier Dispatch Manifest Sheet */}
              <Card className="p-6 border-border/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-base text-foreground">Courier Handover Manifest Sheet</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-9 px-3 text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Print Handover Sheet
                  </Button>
                </div>

                <div className="p-5 rounded-lg border border-border/70 bg-muted/20 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-sm">VOLTMART COURIER DISPATCH MANIFEST</span>
                    <span>DATE: {new Date().toLocaleDateString("en-GB")}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-muted-foreground">3PL CARRIER:</div>
                      <div className="font-bold text-foreground">{dispatchedResult.carrierName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">PICKUP WAREHOUSE:</div>
                      <div className="font-bold text-foreground">{pickupHub}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">CONSIGNMENT ID:</div>
                      <div className="font-bold text-primary">{dispatchedResult.consignmentId}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">COD TO COLLECT:</div>
                      <div className="font-bold text-foreground">৳{codAmount.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-muted-foreground">
                    <div className="space-y-1">
                      <div>Warehouse Dispatcher: ___________________</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div>Courier Rider Signature: ___________________</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Column: Consignment Financial & Destination Summary */}
        <div className="space-y-6">
          <Card className="p-6 border-border/80 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
              Consignment Logistics Specs
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Customer Name:</span>
                <span className="font-semibold text-foreground">{order.customer}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Destination City:</span>
                <span className="font-semibold text-foreground">{isDhaka ? "Inside Dhaka" : "Outside Dhaka"}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Gross Weight:</span>
                <span className="font-mono font-bold text-foreground">{order.packageWeightKg || 0.75} kg</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Estimated Courier Fee:</span>
                <span className="font-mono font-bold text-foreground">৳{estimatedDeliveryFee}</span>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-foreground">COD Cash to Collect:</span>
                <span className="font-mono font-extrabold text-xl text-primary">
                  ৳{codAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {dispatchedResult ? (
              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  className="w-full h-11 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Link href={`/orders/${order.id}/delivery`}>
                    <CheckCircle2 className="h-4 w-4" /> Proceed to Delivery Tracking
                  </Link>
                </Button>
                <a
                  href={dispatchedResult.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold hover:underline pt-1"
                >
                  Track on {dispatchedResult.carrierName} Portal <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <Button
                onClick={handleDispatch}
                disabled={booking}
                className="w-full h-11 font-semibold gap-2 cursor-pointer active:scale-[0.98] transition-all bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PackageCheck className="h-4 w-4" />
                {booking ? "Booking Courier..." : "Shift to Courier & Hand Over"}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
