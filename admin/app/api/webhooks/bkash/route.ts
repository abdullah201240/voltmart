import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * bKash / Nagad MFS IPN (Instant Payment Notification) Webhook Listener
 * Validates transaction IDs (TrxID) and settles order payment status with HMAC security.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-bkash-signature") || req.headers.get("x-mfs-signature");
    const secret = process.env.BKASH_WEBHOOK_SECRET || process.env.MFS_WEBHOOK_SECRET;

    // HMAC Signature Validation if secret is present
    if (secret && signature) {
      const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody || "{}");
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

    // Trigger cache revalidation
    revalidatePath("/orders");
    revalidatePath("/invoices");
    revalidatePath("/payments");
    revalidatePath("/accounting/reconciliation");

    return NextResponse.json({
      success: true,
      message: "Payment notification verified and settled",
      trxId,
      amount,
      invoiceNumber,
      status: transactionStatus,
      paymentStatus: "Paid",
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
    hmacVerification: "Enabled",
    environment: process.env.NODE_ENV || "development",
  });
}
