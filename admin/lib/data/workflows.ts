/**
 * Workflow engine — Odoo-style record actions with side-effects.
 * ------------------------------------------------------------------
 * Each action enforces preconditions, patches the record's overlay fields
 * (so the change is visible across list + detail via the resolvers), and
 * writes a system history event — mirroring how Odoo buttons transition a
 * document state and post to the chatter.
 *
 * Phase 1 covers `sale.order`. Phase 5 adds purchase.order / stock.picking /
 * account.move here, reusing the same ops primitives.
 */

import {
  patchFields,
  addHistory,
  getRecord,
} from "@/lib/data/ops";
import type {
  OrderStatus,
  FulfillmentStatus,
  PaymentStatus,
} from "@/lib/data/orders";

export const SALE_ORDER = "sale.order";

export type SaleAction =
  | "confirm"
  | "ship"
  | "invoice"
  | "payment"
  | "cancel";

export type ActionResult = { ok: boolean; message: string };

/** Read the effective (overlay-merged) status triple for an order. */
export function saleState(ref: string) {
  const { fields } = getRecord(SALE_ORDER, ref);
  return {
    status: (fields.status as OrderStatus | undefined),
    fulfillmentStatus: (fields.fulfillmentStatus as FulfillmentStatus | undefined),
    paymentStatus: (fields.paymentStatus as PaymentStatus | undefined),
    carrier: fields.carrier as string | undefined,
    trackingUrl: fields.trackingUrl as string | undefined,
    invoiceRef: fields.invoiceRef as string | undefined,
  };
}

/**
 * Apply a sale.order action. `current` is the base (pre-overlay) status the
 * page last resolved; the overlay may already have advanced it, so we merge.
 */
export function applySaleAction(
  ref: string,
  customer: string,
  action: SaleAction,
  base: { status: OrderStatus; paymentStatus: PaymentStatus; fulfillmentStatus: FulfillmentStatus },
): ActionResult {
  const live = saleState(ref);
  const status = live.status ?? base.status;
  const paymentStatus = live.paymentStatus ?? base.paymentStatus;
  const fulfillmentStatus = live.fulfillmentStatus ?? base.fulfillmentStatus;

  switch (action) {
    case "confirm": {
      if (status !== "Quotation") return fail("Only a Quotation can be confirmed.");
      patchFields(SALE_ORDER, ref, { status: "Confirmed" });
      addHistory(SALE_ORDER, ref, "Status: Quotation → Confirmed", `Sales order confirmed for ${customer}.`);
      return ok("Order confirmed.");
    }

    case "ship": {
      if (status === "Cancelled") return fail("Cannot deliver a cancelled order.");
      if (status !== "Confirmed") return fail("Confirm the order before creating a delivery.");
      if (fulfillmentStatus === "Fulfilled") return fail("This order is already delivered.");
      const carrier = "DHL Express";
      const trackingUrl = "https://tracking.example.com/" + ref;
      patchFields(SALE_ORDER, ref, {
        status: "Fulfilled",
        fulfillmentStatus: "Fulfilled",
        carrier,
        trackingUrl,
      });
      addHistory(SALE_ORDER, ref, "Status: Confirmed → Fulfilled", `Delivery validated · carrier ${carrier} · tracking linked.`);
      return ok("Delivery created & validated.");
    }

    case "invoice": {
      if (status === "Cancelled") return fail("Cannot invoice a cancelled order.");
      if (status === "Quotation") return fail("Confirm the order before invoicing.");
      if (status === "Invoiced") return fail("An invoice already exists for this order.");
      const invoiceRef = `INV/${ref}`;
      patchFields(SALE_ORDER, ref, { status: "Invoiced", invoiceRef });
      addHistory(SALE_ORDER, ref, "Status → Invoiced", `Customer invoice ${invoiceRef} created (draft → posted).`);
      return ok("Invoice created.");
    }

    case "payment": {
      if (status === "Quotation") return fail("Confirm the order before registering payment.");
      if (status === "Cancelled") return fail("Cannot pay a cancelled order.");
      if (paymentStatus === "Paid") return fail("Payment is already registered.");
      patchFields(SALE_ORDER, ref, { paymentStatus: "Paid" });
      addHistory(SALE_ORDER, ref, "Payment: Pending → Paid", `Inbound payment registered and reconciled for ${customer}.`);
      return ok("Payment registered.");
    }

    case "cancel": {
      if (status === "Cancelled") return fail("Order is already cancelled.");
      if (status === "Invoiced") return fail("Post a credit note to cancel an invoiced order.");
      patchFields(SALE_ORDER, ref, { status: "Cancelled" });
      addHistory(SALE_ORDER, ref, `Status: ${status} → Cancelled`, "Order cancelled.");
      return ok("Order cancelled.");
    }
  }
}

function ok(message: string): ActionResult {
  return { ok: true, message };
}
function fail(message: string): ActionResult {
  return { ok: false, message };
}
