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

// ------------------------------------------------------------------
// Purchasing (`purchase.order`) — Phase 5
// ------------------------------------------------------------------

import type { PoState } from "@/lib/data/purchasing";

export const PURCHASE_ORDER = "purchase.order";

export type PoAction = "send" | "approve" | "confirm" | "receive" | "lock" | "cancel";

/** Effective (overlay-merged) status pair for a purchase order. */
export function poState(ref: string) {
  const { fields } = getRecord(PURCHASE_ORDER, ref);
  return {
    state: fields.state as PoState | undefined,
    received: fields.received as boolean | undefined,
  };
}

/** Apply a purchase.order action with Odoo-style RFQ → PO → receipt transitions. */
export function applyPoAction(
  ref: string,
  vendor: string,
  action: PoAction,
  base: { state: PoState; received: boolean },
): ActionResult {
  const live = poState(ref);
  const state = live.state ?? base.state;
  const received = live.received ?? base.received;

  switch (action) {
    case "send": {
      if (state !== "draft") return fail("Only a draft RFQ can be sent to the vendor.");
      patchFields(PURCHASE_ORDER, ref, { state: "sent" });
      addHistory(PURCHASE_ORDER, ref, "RFQ sent to vendor", `Quotation ${ref} emailed to ${vendor}, awaiting their confirmation.`);
      return ok("RFQ sent by email.");
    }
    case "approve": {
      if (state !== "to approve") return fail("This order is not awaiting approval.");
      patchFields(PURCHASE_ORDER, ref, { state: "purchase" });
      addHistory(PURCHASE_ORDER, ref, "Approved → Purchase Order", `Purchase order ${ref} approved; awaiting receipt.`);
      return ok("Purchase order approved.");
    }
    case "confirm": {
      if (state !== "sent" && state !== "draft") return fail("Only an RFQ (draft or sent) can be confirmed.");
      patchFields(PURCHASE_ORDER, ref, { state: "purchase" });
      addHistory(PURCHASE_ORDER, ref, `Status: ${state} → Purchase Order`, `PO ${ref} confirmed with ${vendor}; receipt created and products reserved.`);
      return ok("Purchase Order confirmed — receipt created.");
    }
    case "receive": {
      if (state !== "purchase") return fail("Confirm the purchase order before receiving.");
      if (received) return fail("Products have already been received for this order.");
      patchFields(PURCHASE_ORDER, ref, { received: true });
      addHistory(PURCHASE_ORDER, ref, "Receipt validated", `Incoming transfer for ${ref} validated — stock moved into WH/Stock.`);
      return ok("Products received into stock.");
    }
    case "lock": {
      if (!received) return fail("Validate the receipt before locking the order.");
      if (state === "done") return fail("Order is already locked.");
      if (state !== "purchase") return fail("Only a confirmed purchase order can be locked.");
      patchFields(PURCHASE_ORDER, ref, { state: "done" });
      addHistory(PURCHASE_ORDER, ref, "Status → Locked", `PO ${ref} locked — the bill can now be drafted.`);
      return ok("Order locked.");
    }
    case "cancel": {
      if (state === "cancel") return fail("Order is already cancelled.");
      if (state === "done") return fail("Locked orders cannot be cancelled — use a vendor credit note.");
      patchFields(PURCHASE_ORDER, ref, { state: "cancel" });
      addHistory(PURCHASE_ORDER, ref, `Status: ${state} → Cancelled`, `PO ${ref} cancelled; related receipt (if any) dropped.`);
      return ok("Purchase order cancelled.");
    }
  }
}

// ------------------------------------------------------------------
// Warehouse (`stock.picking`) — Phase 5
// ------------------------------------------------------------------

import type { PickingState, PickingKind } from "@/lib/data/inventory";

export const STOCK_PICKING = "stock.picking";

export type PickingAction = "confirm" | "reserve" | "transfer" | "cancel";

export function pickingState(ref: string): PickingState | undefined {
  return getRecord(STOCK_PICKING, ref).fields.state as PickingState | undefined;
}

/** Apply a picking action; validating an incoming receipt also updates its PO. */
export function applyPickingAction(
  ref: string,
  kind: PickingKind,
  partner: string,
  origin: string,
  action: PickingAction,
  base: { state: PickingState },
): ActionResult {
  const state = pickingState(ref) ?? base.state;

  switch (action) {
    case "confirm": {
      if (state !== "draft") return fail("Only a draft operation can be confirmed.");
      patchFields(STOCK_PICKING, ref, { state: "confirmed" });
      addHistory(STOCK_PICKING, ref, "Draft → Confirmed", `${ref} confirmed for ${partner}; products are being awaited.`);
      return ok("Operation confirmed.");
    }
    case "reserve": {
      if (state !== "confirmed") return fail("Confirm the operation before reserving products.");
      patchFields(STOCK_PICKING, ref, { state: "assigned" });
      addHistory(STOCK_PICKING, ref, "Waiting → Ready", `Products reserved for ${ref} — ready to ${kind === "incoming" ? "receive" : "ship"}.`);
      return ok("Products reserved.");
    }
    case "transfer": {
      if (state === "done") return fail("This transfer is already validated.");
      if (state === "draft") return fail("Confirm and reserve the operation before validating.");
      patchFields(STOCK_PICKING, ref, { state: "done" });
      if (kind === "outgoing") {
        patchFields(STOCK_PICKING, ref, { state: "done", carrier: "DHL Express", tracking: `DHL${ref.replace(/\D/g, "").slice(-6)}` });
      }
      addHistory(STOCK_PICKING, ref, "State → Done", kind === "incoming" ? `Receipt validated — stock from ${partner} moved into WH/Stock.` : kind === "outgoing" ? `Delivery validated for ${partner} — handed to the carrier.` : `Internal transfer ${ref} validated.`);
      // Cross-document effect: an incoming receipt settles its originating PO.
      if (kind === "incoming" && /^P\d{5}$/.test(origin)) {
        patchFields(PURCHASE_ORDER, origin, { received: true });
        addHistory(PURCHASE_ORDER, origin, "Receipt validated", `Incoming transfer ${ref} validated — PO receipt marked received.`);
      }
      return ok("Transfer validated.");
    }
    case "cancel": {
      if (state === "done") return fail("Validated transfers cannot be cancelled — do a return instead.");
      if (state === "cancel") return fail("Operation is already cancelled.");
      patchFields(STOCK_PICKING, ref, { state: "cancel" });
      addHistory(STOCK_PICKING, ref, `State: ${state} → Cancelled`, "Operation cancelled; reservations released.");
      return ok("Operation cancelled.");
    }
  }
}


// ------------------------------------------------------------------
// Accounting (`account.move`) — Phase 4
// ------------------------------------------------------------------

import type { MoveState } from "@/lib/data/finance";

export const ACCOUNT_MOVE = "account.move";

export type MoveAction = "post" | "cancel" | "undo";

/** Effective (overlay-merged) state of an account move. */
export function moveState(ref: string): MoveState | undefined {
  return getRecord(ACCOUNT_MOVE, ref).fields.state as MoveState | undefined;
}

/**
 * Apply an account.move journalling action. `balanced` enforces the Odoo
 * rule that only a balanced entry (debits = credits) may be posted.
 */
export function applyMoveAction(
  ref: string,
  action: MoveAction,
  base: { state: MoveState },
  balanced = true,
): ActionResult {
  const live = moveState(ref);
  const state = live ?? base.state;

  switch (action) {
    case "post": {
      if (state === "Posted" || state === "Paid") return fail("This entry is already posted.");
      if (state === "Cancelled") return fail("Restore the entry to draft before posting.");
      if (!balanced) return fail("Entry is not balanced — debits must equal credits before posting.");
      patchFields(ACCOUNT_MOVE, ref, { state: "Posted" });
      addHistory(ACCOUNT_MOVE, ref, `State: ${state} → Posted`, "Journal entry posted; movements are now accounted in the ledger.");
      return ok("Entry posted.");
    }
    case "cancel": {
      if (state === "Cancelled") return fail("Entry is already cancelled.");
      if (state === "Paid") return fail("Paid entries cannot be cancelled — use a credit note.");
      patchFields(ACCOUNT_MOVE, ref, { state: "Cancelled" });
      addHistory(ACCOUNT_MOVE, ref, `State: ${state} → Cancelled`, "Entry cancelled; no ledger effect.");
      return ok("Entry cancelled.");
    }
    case "undo": {
      if (state !== "Posted") return fail("Only posted entries can be reset to draft.");
      patchFields(ACCOUNT_MOVE, ref, { state: "Draft" });
      addHistory(ACCOUNT_MOVE, ref, "State: Posted → Draft", "Entry reset to draft.");
      return ok("Entry reset to draft.");
    }
  }
}


// ------------------------------------------------------------------
// Catalog (`product.template`) — publication lifecycle
// ------------------------------------------------------------------

import type { ProductStatus } from "@/lib/data/products";

export const PRODUCT_TEMPLATE = "product.template";

export type ProductAction = "publish" | "unpublish" | "archive" | "unarchive";

/** Effective (overlay-merged) publication status of a product template. */
export function productStatus(ref: string): ProductStatus | undefined {
  return getRecord(PRODUCT_TEMPLATE, ref).fields.status as ProductStatus | undefined;
}

/**
 * Apply a catalog publication action (Odoo `product.template` lifecycle:
 * Draft → Published, Archived restores to Draft).
 */
export function applyProductAction(
  ref: string,
  name: string,
  action: ProductAction,
  base: { status: ProductStatus },
): ActionResult {
  const state = productStatus(ref) ?? base.status;

  switch (action) {
    case "publish": {
      if (state === "Active") return fail(`"${name}" is already published.`);
      if (state === "Archived") return fail("Unarchive the product before publishing.");
      patchFields(PRODUCT_TEMPLATE, ref, { status: "Active" });
      addHistory(PRODUCT_TEMPLATE, ref, `State: ${state} → Active`, `${name} is now visible on its sales channels.`);
      return ok("Product published.");
    }
    case "unpublish": {
      if (state !== "Active") return fail(`"${name}" is not published.`);
      patchFields(PRODUCT_TEMPLATE, ref, { status: "Draft" });
      addHistory(PRODUCT_TEMPLATE, ref, "State: Active → Draft", `${name} unpublished from all channels.`);
      return ok("Product moved to draft.");
    }
    case "archive": {
      if (state === "Archived") return fail(`"${name}" is already archived.`);
      patchFields(PRODUCT_TEMPLATE, ref, { status: "Archived" });
      addHistory(PRODUCT_TEMPLATE, ref, `State: ${state} → Archived`, `${name} archived; hidden from the storefront.`);
      return ok("Product archived.");
    }
    case "unarchive": {
      if (state !== "Archived") return fail(`"${name}" is not archived.`);
      patchFields(PRODUCT_TEMPLATE, ref, { status: "Draft" });
      addHistory(PRODUCT_TEMPLATE, ref, "State: Archived → Draft", `${name} restored to draft.`);
      return ok("Product restored to draft.");
    }
  }
}


// ------------------------------------------------------------------
// Bank reconciliation (`account.bank.statement.line`)
// ------------------------------------------------------------------

export const BANK_STATEMENT = "account.bank.statement.line";

/** Effective reconciliation status of a bank statement line. */
export function statementStatus(ref: string): "unreconciled" | "reconciled" {
  const s = getRecord(BANK_STATEMENT, ref).fields.status as "reconciled" | undefined;
  return s === "reconciled" ? "reconciled" : "unreconciled";
}

/**
 * Reconcile a bank statement line. When `match` is supplied (an open
 * invoice/bill under `account.move`), the matched document is settled to
 * Paid — mirroring Odoo auto-matching a bank movement to its receivable /
 * payable. Otherwise the line is booked directly to an account.
 */
export function reconcileStatement(
  ref: string,
  label: string,
  match: { docRef: string; docNumber: string } | null,
): ActionResult {
  if (statementStatus(ref) === "reconciled") return fail("This bank line is already reconciled.");
  patchFields(BANK_STATEMENT, ref, { status: "reconciled" });
  if (match) {
    patchFields(ACCOUNT_MOVE, match.docRef, { state: "Paid" });
    addHistory(ACCOUNT_MOVE, match.docRef, "Payment reconciled", `Bank line "${label}" matched and reconciled against ${match.docNumber}.`);
    addHistory(BANK_STATEMENT, ref, "Reconciled", `${label} ↔ ${match.docNumber}.`);
    return ok(`Reconciled against ${match.docNumber}.`);
  }
  addHistory(BANK_STATEMENT, ref, "Reconciled", `${label} reconciled directly to its account.`);
  return ok("Line reconciled on account.");
}

/** Reverse a reconciliation; the matched document reverts to Posted. */
export function unreconcileStatement(
  ref: string,
  label: string,
  match: { docRef: string; docNumber: string } | null,
): ActionResult {
  if (statementStatus(ref) !== "reconciled") return fail("This bank line is not reconciled yet.");
  patchFields(BANK_STATEMENT, ref, { status: "unreconciled" });
  if (match) {
    patchFields(ACCOUNT_MOVE, match.docRef, { state: "Posted" });
    addHistory(ACCOUNT_MOVE, match.docRef, "Reconciliation reversed", `Bank line "${label}" un-reconciled from ${match.docNumber}.`);
  }
  addHistory(BANK_STATEMENT, ref, "Unreconciled", `${label} moved back to the unreconciled feed.`);
  return ok("Reconciliation reversed.");
}

// ------------------------------------------------------------------
// Replenishment (`stock.warehouse.orderpoint`) — reorder-rule scheduler
// ------------------------------------------------------------------
// Mirrors Odoo's minimum/maximum rules: when free stock dips to/below the
// minimum, the scheduler proposes a procurement to top back up to the max.
// Running it "orders" the rule (generating a procurement reference); the
// effect persists through the overlay so the board reflects it everywhere.

export const ORDERPOINT = "stock.warehouse.orderpoint";

export interface OrderpointLive {
  status: "ordered" | null;
  procurementRef: string | null;
  orderedQty: number | null;
  vendor: string | null;
}

/** Effective (overlay-merged) state of a reorder rule. */
export function orderpointState(ref: string): OrderpointLive {
  const f = getRecord(ORDERPOINT, ref).fields;
  return {
    status: (f.status as "ordered" | undefined) ?? null,
    procurementRef: (f.procurementRef as string | undefined) ?? null,
    orderedQty: (f.orderedQty as number | undefined) ?? null,
    vendor: (f.vendor as string | undefined) ?? null,
  };
}

/** Generate a procurement for a triggered order point. */
export function scheduleOrderpoint(
  ref: string,
  product: string,
  qty: number,
  vendor: string,
): ActionResult {
  const live = orderpointState(ref);
  if (live.status === "ordered") {
    return fail(`${product} is already in replenishment (${live.procurementRef}).`);
  }
  if (qty <= 0) return fail(`${product} has enough stock — nothing to order.`);
  const procurementRef = `PO/${ref}`;
  patchFields(ORDERPOINT, ref, { status: "ordered", procurementRef, orderedQty: qty, vendor });
  addHistory(ORDERPOINT, ref, "Procurement scheduled", `Scheduler generated ${procurementRef}: ${qty} × ${product} from ${vendor}.`);
  return ok(`Procurement ${procurementRef} created · ${qty} units.`);
}

/** Cancel a generated procurement, returning the rule to triggered. */
export function cancelOrderpoint(ref: string, product: string): ActionResult {
  const live = orderpointState(ref);
  if (live.status !== "ordered") return fail("This rule has no pending procurement to cancel.");
  patchFields(ORDERPOINT, ref, { status: null, procurementRef: null, orderedQty: null });
  addHistory(ORDERPOINT, ref, "Procurement cancelled", `Removed the pending procurement for ${product}.`);
  return ok("Procurement cancelled.");
}

