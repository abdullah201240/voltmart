import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Orders API Handler
 * Handles cross-origin order creation from Storefront and returns live orders.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Order Ingested from Storefront]:", body);

    const orderId = body.id || `ORD-${Date.now().toString().slice(-4)}`;
    const customer = body.customer || body.name || "Online Customer";
    const email = body.email || "customer@example.com";
    const totalValue = Number(body.total || 0);
    const channel = "BD Online (BDT)";
    const channelKey = "default-channel";
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newOrder = {
      id: orderId,
      customer,
      email,
      channel,
      channelKey,
      date,
      totalValue,
      total: "৳" + totalValue.toLocaleString("en-BD", { minimumFractionDigits: 2 }),
      itemCount: Array.isArray(body.items) ? body.items.length : 1,
      status: "Confirmed",
      paymentStatus: body.payment === "Cash on Delivery" ? "Pending" : "Paid",
      fulfillmentStatus: "Unfulfilled",
      shippingAddress: body.address || "House 12, Road 5, Gulshan 2, Dhaka",
      billingAddress: body.address || "House 12, Road 5, Gulshan 2, Dhaka",
      carrier: "Pathao Courier Express",
    };

    revalidatePath("/orders");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
        message: `Order ${orderId} successfully registered in VoltMart Core`,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
