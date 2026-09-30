"use server";

import { revalidatePath } from "next/cache";
import { createPathaoConsignment } from "@/lib/logistics/pathao";
import { createSteadfastConsignment } from "@/lib/logistics/steadfast";

export interface FulfillOrderParams {
  orderId: string;
  carrier: "pathao" | "steadfast";
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity?: string;
  amountToCollect: number;
  totalWeightKg?: number;
  orderNumber?: string;
}

export async function fulfillOrderWithCourierAction(params: FulfillOrderParams) {
  try {
    let consignmentId = "";
    let trackingUrl = "";
    let deliveryFee = 60;

    if (params.carrier === "pathao") {
      const result = await createPathaoConsignment({
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone,
        recipientAddress: params.recipientAddress,
        recipientCity: params.recipientCity || "Dhaka",
        amountToCollect: params.amountToCollect,
        itemQuantity: 1,
        itemWeight: params.totalWeightKg || 0.5,
        orderNote: `Order #${params.orderNumber || params.orderId} - VoltMart Electronics`,
      });
      consignmentId = result.consignmentId;
      trackingUrl = result.trackingUrl;
      deliveryFee = result.deliveryFee;
    } else {
      const result = await createSteadfastConsignment({
        invoice: params.orderNumber || params.orderId,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone,
        recipientAddress: params.recipientAddress,
        codAmount: params.amountToCollect,
      });
      consignmentId = result.consignmentId;
      trackingUrl = `https://steadfast.com.bd/t/${result.trackingCode}`;
      deliveryFee = result.deliveryFee;
    }

    // Revalidate relevant pages in Next.js
    revalidatePath("/orders");
    revalidatePath(`/orders/${params.orderId}`);
    revalidatePath("/inventory/deliveries");

    return {
      success: true,
      consignmentId,
      trackingUrl,
      deliveryFee,
      carrier: params.carrier === "pathao" ? "Pathao Courier" : "Steadfast Courier",
    };
  } catch (error: any) {
    console.error("[Fulfill Action Error]:", error);
    return {
      success: false,
      error: error.message || "Failed to book courier consignment.",
    };
  }
}
