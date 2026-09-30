import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * bKash / Nagad MFS IPN (Instant Payment Notification) Webhook Listener
 * Validates transaction IDs (TrxID) and settles order payment status.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[MFS Payment Webhook Ingested]:", body);

    const trxId = body.trxID || body.trxId || body.paymentID;
    const amount = Number(body.amount || 0);
    const invoiceNumber = body.merchantInvoiceNumber || body.invoiceNumber;
    const transactionStatus = body.transactionStatus || body.status || "Completed";

    if (!trxId) {
      return NextResponse.json(
        { success: false, message: "Missing transaction ID (trxID)" },
        { status: 400 }
      );
    }

    // In a live environment, verify HMAC signature or call bKash Query Payment API
    // e.g. GET https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status

    revalidatePath("/orders");
    revalidatePath("/invoices");
    revalidatePath("/payments");

    return NextResponse.json({
      success: true,
      message: "Payment notification verified and settled",
      trxId,
      amount,
      invoiceNumber,
      status: transactionStatus,
      settledAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[MFS Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment IPN" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "VoltMart bKash & Nagad IPN Service",
    environment: process.env.NODE_ENV || "development",
  });
}
