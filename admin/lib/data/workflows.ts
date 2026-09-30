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

/**
 * Direct stage change (Kanban drag / manual override). Mirrors Odoo's manual
 * stage move: patches the status and posts a system history line. Keeps the
 * fulfillment/payment side-effects coherent with the target lifecycle state.
 */
export function setSaleStatus(
  ref: string,
  to: OrderStatus,
  base: { status: OrderStatus; paymentStatus: PaymentStatus; fulfillmentStatus: FulfillmentStatus },
): ActionResult {
  const live = saleState(ref);
  const from = live.status ?? base.status;
  if (from === to) return ok("No change.");

  const patch: Record<string, unknown> = { status: to };
  // Coherent side-effects when moving backwards/forwards in the pipeline.
  if (to === "Fulfilled" && (base.fulfillmentStatus === "Unfulfilled" || live.fulfillmentStatus === "Unfulfilled")) {
    patch.fulfillmentStatus = "Fulfilled";
    patch.carrier = "DHL Express";
    patch.trackingUrl = "https://tracking.example.com/" + ref;
  }
  if (to === "Cancelled") {
    /* leave payment/fulfillment as-is; cancel only flips status */
  }
  patchFields(SALE_ORDER, ref, patch);
  addHistory(SALE_ORDER, ref, `Status: ${from} → ${to}`, `Stage changed to ${to}.`);
  return ok(`Moved to ${to}.`);
}

// ------------------------------------------------------------------
// Manufacturing (`mrp.production`) — Phase 3
// ------------------------------------------------------------------

import type { MoState } from "@/lib/data/manufacturing";

export const MRP_PRODUCTION = "mrp.production";

export type MoAction = "confirm" | "start" | "produce" | "close" | "cancel";

/** Apply a manufacturing-order action with Odoo-style side-effects. */
export function applyMoAction(
  ref: string,
  action: MoAction,
  base: { state: MoState; qty: number; qtyProduced: number },
  extraQty = 0,
): ActionResult {
  const live = getRecord(MRP_PRODUCTION, ref).fields;
  const state = (live.state as MoState | undefined) ?? base.state;
  const qty = base.qty;
  const produced = ((live.qtyProduced as number | undefined) ?? base.qtyProduced);

  switch (action) {
    case "confirm": {
      if (state !== "Planned") return fail("Only a planned MO can be confirmed.");
      patchFields(MRP_PRODUCTION, ref, { state: "Confirmed" });
      addHistory(MRP_PRODUCTION, ref, "State: Planned → Confirmed", "Components reserved for production.");
      return ok("Manufacturing order confirmed.");
    }
    case "start": {
      if (state !== "Confirmed") return fail("Confirm the MO before starting production.");
      patchFields(MRP_PRODUCTION, ref, { state: "In Progress" });
      addHistory(MRP_PRODUCTION, ref, "State: Confirmed → In Progress", "Production started; work orders opened.");
      return ok("Production started.");
    }
    case "produce": {
      if (state !== "In Progress") return fail("Start production before posting quantities.");
      const next = Math.min(qty, produced + Math.max(1, extraQty));
      const to = next >= qty ? "To Close" : "In Progress";
      patchFields(MRP_PRODUCTION, ref, { qtyProduced: next, state: to as MoState });
      addHistory(MRP_PRODUCTION, ref, `Produced ${next}/${qty}`, to === "To Close" ? "All units produced — ready to close." : "Progress posted.");
      return ok(`Recorded ${next} of ${qty} produced.`);
    }
    case "close": {
      if (state !== "To Close" && state !== "In Progress") return fail("Nothing to close yet.");
      patchFields(MRP_PRODUCTION, ref, { qtyProduced: qty, state: "Done" });
      addHistory(MRP_PRODUCTION, ref, "State → Done", `Finished product quant posted (${qty} ${base.qty ? "units" : ""}).`);
      return ok("Manufacturing order closed.");
    }
    case "cancel": {
      if (state === "Done") return fail("Cannot cancel a finished MO.");
      if (state === "Cancelled") return fail("MO is already cancelled.");
      patchFields(MRP_PRODUCTION, ref, { state: "Cancelled" });
      addHistory(MRP_PRODUCTION, ref, `State: ${state} → Cancelled`, "Manufacturing order cancelled; reservations released.");
      return ok("MO cancelled.");
    }
  }
}

/** Direct MO stage change via Kanban drag. */
export function setMoState(ref: string, to: MoState, base: { state: MoState; qty: number; qtyProduced: number }): ActionResult {
  const live = getRecord(MRP_PRODUCTION, ref).fields;
  const from = (live.state as MoState | undefined) ?? base.state;
  if (from === to) return ok("No change.");
  const patch: Record<string, unknown> = { state: to };
  if (to === "Done") patch.qtyProduced = base.qty;
  if (to === "Planned") patch.qtyProduced = 0;
  patchFields(MRP_PRODUCTION, ref, patch);
  addHistory(MRP_PRODUCTION, ref, `State: ${from} → ${to}`, "Stage changed.");
  return ok(`Moved to ${to}.`);
}
