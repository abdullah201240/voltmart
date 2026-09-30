import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Inbound Courier Tracking Webhook Listener
 * Supports Pathao, Steadfast, and Paperfly tracking event ingestion.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Courier Webhook Ingested]:", body);

    // Identify carrier and payload structure
    const consignmentId =
      body.consignment_id ||
      body.consignmentId ||
      body.order_id ||
      body.tracking_code;

    const eventStatus =
      body.order_status ||
      body.status ||
      body.delivery_status ||
      "updated";

    if (!consignmentId) {
      return NextResponse.json(
        { success: false, message: "Missing consignment ID" },
        { status: 400 }
      );
    }

    // In a production setup, map status and update database / Odoo / Saleor
    // e.g. "Delivered" -> complete fulfillment and settle COD balance
    // e.g. "RTM / Returned" -> restock inventory
    revalidatePath("/orders");
    revalidatePath("/inventory/deliveries");

    return NextResponse.json({
      success: true,
      processed: true,
      consignmentId,
      status: eventStatus,
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
  });
}
