"use server";

import {
  authenticateStaff,
  getSaleorChannels,
  getSaleorProducts,
  getSaleorOrders,
} from "@/lib/saleor/client";

/**
 * Server Action: Authenticate staff with Saleor Core
 */
export async function authenticateStaffAction() {
  try {
    const session = await authenticateStaff();
    if (!session) {
      return { success: false, error: "Authentication failed" };
    }
    return {
      success: true,
      user: session.user,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Fetch live channels from Saleor
 */
export async function fetchSaleorChannelsAction() {
  try {
    const channels = await getSaleorChannels();
    return { success: true, channels };
  } catch (err: any) {
    return { success: false, error: err.message, channels: [] };
  }
}

/**
 * Server Action: Fetch live products from Saleor
 */
export async function fetchSaleorProductsAction(channel = "default-channel") {
  try {
    const products = await getSaleorProducts(channel, 20);
    return { success: true, products };
  } catch (err: any) {
    return { success: false, error: err.message, products: [] };
  }
}

/**
 * Server Action: Fetch live orders from Saleor
 */
export async function fetchSaleorOrdersAction() {
  try {
    const orders = await getSaleorOrders(20);
    return { success: true, orders };
  } catch (err: any) {
    return { success: false, error: err.message, orders: [] };
  }
}
