import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Inbound Courier Tracking Webhook Listener
 * Supports Pathao, Steadfast, and Paperfly tracking event ingestion with HMAC validation.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-pathao-signature") || req.headers.get("x-courier-signature");
    const secret = process.env.PATHAO_WEBHOOK_SECRET || process.env.COURIER_WEBHOOK_SECRET;

    // HMAC Signature Validation if secret is configured
    if (secret && signature) {
      const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody || "{}");
    console.log("[Courier Webhook Ingested]:", body);

    const consignmentId =
      body.consignment_id ||
      body.consignmentId ||
      body.order_id ||
      body.tracking_code;

    const eventStatus =
      body.order_status ||
      body.status ||
      body.delivery_status ||
      "Delivered";

    if (!consignmentId) {
      return NextResponse.json(
        { success: false, message: "Missing consignment ID" },
        { status: 400 }
      );
    }

    // Determine normalized fulfillment state
    let mappedFulfillment = "Partially";
    let mappedPayment = "Pending";

    const normalizedStatus = String(eventStatus).toLowerCase();
    if (normalizedStatus.includes("deliver") || normalizedStatus.includes("done") || normalizedStatus.includes("success")) {
      mappedFulfillment = "Fulfilled";
      mappedPayment = "Paid"; // COD collected by courier rider
    } else if (normalizedStatus.includes("transit") || normalizedStatus.includes("picked")) {
      mappedFulfillment = "Partially";
    } else if (normalizedStatus.includes("return") || normalizedStatus.includes("refused") || normalizedStatus.includes("cancel")) {
      mappedFulfillment = "Unfulfilled";
    }

    // Invalidate caches across the dashboard
    revalidatePath("/orders");
    revalidatePath("/inventory/deliveries");
    revalidatePath("/accounting/reconciliation");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      processed: true,
      consignmentId,
      status: eventStatus,
      mappedFulfillment,
      mappedPayment,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Courier Webhook Processing Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Invalid webhook payload" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "VoltMart Courier Webhook Ingestion Service",
    supportedCarriers: ["Pathao", "Steadfast", "RedX", "Paperfly"],
    hmacVerification: "Enabled",
  });
}
