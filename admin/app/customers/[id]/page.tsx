"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShoppingBag,
  Banknote,
} from "lucide-react";
import { getCustomerById, type CustomerDetail } from "@/lib/data/customers";
import type { OrderStatus } from "@/lib/data/orders";
import { RecordChatter } from "@/components/ui/record-chatter";
import { useOps } from "@/lib/data/ops";

const STATUS_CLASS: Record<OrderStatus, "default" | "secondary" | "outline"> = {
  Quotation: "secondary",
  Confirmed: "secondary",
  Fulfilled: "default",
  Invoiced: "default",
  Cancelled: "outline",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const version = useOps();
  const [customer, setCustomer] = useState<CustomerDetail | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCustomerById(params.id).then((c) => {
      if (alive) {
        setCustomer(c);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id, version]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="p-7 shadow-xs border-border/80">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Customer not found</h1>
          <p className="text-sm text-muted-foreground mt-1">No customer matches <span className="font-mono">{params.id}</span>.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <Badge variant={customer.status === "Active" ? "default" : "outline"} className="text-xs font-semibold">{customer.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Joined {customer.joined}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 text-sm font-medium"><Mail className="mr-2 h-4 w-4" /> Email</Button>
          <Button className="h-10 px-4 text-sm font-medium"><ShoppingBag className="mr-2 h-4 w-4" /> New Order</Button>
        </div>
      </div>

      {/* Snapshot KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 shadow-xs border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"><Banknote className="h-4 w-4" /> Lifetime Spent</div>
          <div className="mt-2 text-2xl font-bold font-mono">{money(customer.totalSpent)}</div>
        </Card>
        <Card className="p-5 shadow-xs border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"><ShoppingBag className="h-4 w-4" /> Total Orders</div>
          <div className="mt-2 text-2xl font-bold font-mono">{customer.orders}</div>
        </Card>
        <Card className="p-5 shadow-xs border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segments</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customer.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs font-semibold">{t}</Badge>)}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <Card className="p-6 shadow-xs border-border/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/orders" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-border/80">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Order</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-border/70">
                      <td className="px-4 py-2.5 font-mono font-medium">
                        <Link href={`/orders/${o.id}`} className="hover:text-primary transition-colors">{o.id}</Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{o.date}</td>
                      <td className="px-4 py-2.5"><Badge variant={STATUS_CLASS[o.status]} className="text-xs font-semibold">{o.status}</Badge></td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Profile sidebar */}
        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Building2 className="h-4 w-4" /> Contact
            </div>
            <InfoRow label="Email" value={customer.email} icon={Mail} />
            <InfoRow label="Phone" value={customer.phone} icon={Phone} />
            <InfoRow label="Company" value={customer.company} />
            <Separator className="my-2" />
            <InfoRow label="City" value={customer.city} />
            <InfoRow label="Country" value={customer.country} icon={MapPin} />
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <MapPin className="h-4 w-4" /> Addresses
            </div>
            <div className="py-1.5">
              <div className="text-xs text-muted-foreground mb-0.5">Shipping</div>
              <div className="text-sm font-medium text-foreground">{customer.shippingAddress}</div>
            </div>
            <Separator className="my-2" />
            <div className="py-1.5">
              <div className="text-xs text-muted-foreground mb-0.5">Billing</div>
              <div className="text-sm font-medium text-foreground">{customer.billingAddress}</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Odoo chatter — messages, internal notes, activities, history */}
      <RecordChatter model="res.partner" recordId={customer.id} />
    </>
  );
}
