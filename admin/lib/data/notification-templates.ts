/**
 * Notification / email template settings data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the transactional message templates an operator edits
 * under Settings → Notifications (Saleor `notificationsSettings`). Each
 * template maps a business event to a subject + body over a delivery channel
 * (email / SMS / push). Edits persist through the `ops.ts` overlay so the
 * editor is genuinely wired, not decorative.
 *
 * Self-contained — no SMTP / SMS gateway is actually invoked.
 */

import { withOverlay, patchFields } from "@/lib/data/ops";

export type NotifyChannel = "email" | "sms" | "push";

export interface NotificationTemplate {
  id: string;
  event: string;
  channel: NotifyChannel;
  subject: string;
  body: string;
  enabled: boolean;
}

export const NOTIFY_CHANNEL_OPTIONS = [
  { value: "all", label: "All Channels" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

const MODEL = "notify.template";

const TEMPLATES: NotificationTemplate[] = [
  { id: "nt-order-conf", event: "Order Confirmation", channel: "email", subject: "VoltMart — your order {{ order.id }} is confirmed", body: "Hi {{ customer.name }},\n\nThanks for shopping at VoltMart. We've received order {{ order.id }} totalling {{ order.total }} and will dispatch it shortly.\n\n— The VoltMart team", enabled: true },
  { id: "nt-ship", event: "Shipment / Delivery", channel: "email", subject: "Your VoltMart order {{ order.id }} is on the way", body: "Hi {{ customer.name }},\n\nOrder {{ order.id }} has shipped via {{ delivery.carrier }}. Track it here: {{ delivery.trackingUrl }}", enabled: true },
  { id: "nt-cod-otp", event: "COD Phone Verification", channel: "sms", subject: "COD OTP", body: "VoltMart: your delivery OTP is {{ order.otp }}. Never share this code with your rider.", enabled: true },
  { id: "nt-pay-remind", event: "Payment Reminder", channel: "email", subject: "A pending payment on order {{ order.id }}", body: "Hi {{ customer.name }}, your payment for order {{ order.id }} is still pending. Complete it to avoid auto-cancellation.", enabled: false },
  { id: "nt-rma-update", event: "Return / RMA Status", channel: "email", subject: "Update on your return {{ rma.id }}", body: "Hi {{ customer.name }}, your return {{ rma.id }} is now {{ rma.state }}. We'll keep you posted at each step.", enabled: true },
  { id: "nt-low-stock", event: "Back-in-Stock Alert", channel: "push", subject: "It's back!", body: "{{ product.name }} is back in stock at VoltMart. Reserve yours before it sells out again.", enabled: false },
];

/** Effective (overlay-merged) list of templates. */
export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  return TEMPLATES.map((t) => withOverlay(MODEL, t.id, t));
}

/** Persist an edit to a template (subject / body / enabled). */
export function saveTemplate(id: string, patch: Partial<Pick<NotificationTemplate, "subject" | "body" | "enabled">>) {
  patchFields(MODEL, id, patch);
}

/** Read the current (possibly edited) version of one template. */
export function readTemplate(id: string): NotificationTemplate {
  return withOverlay(MODEL, id, TEMPLATES.find((t) => t.id === id) as NotificationTemplate);
}

export function templateEnabledCount(rows: NotificationTemplate[]) {
  return rows.filter((r) => r.enabled).length;
}
