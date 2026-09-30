/**
 * Odoo 19 JSON-RPC Bridge Client
 * Connects to live Odoo 19 Community instance (http://localhost:8069/jsonrpc)
 */

const ODOO_URL = process.env.ODOO_URL || "http://localhost:8069/jsonrpc";
const ODOO_DB = process.env.ODOO_DB || "odoo";
const ODOO_USER = process.env.ODOO_USER || "admin";
const ODOO_PASS = process.env.ODOO_PASS || "admin";

interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  id: number | null;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

let cachedUid: number | null = null;

/**
 * Execute raw JSON-RPC call against Odoo
 */
export async function odooCall<T = any>(
  service: "common" | "object" | "db",
  method: string,
  args: any[]
): Promise<T> {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service,
      method,
      args,
    },
    id: Math.floor(Math.random() * 100000),
  };

  try {
    const res = await fetch(ODOO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data: JsonRpcResponse<T> = await res.json();
    if (data.error) {
      console.error("[Odoo JSON-RPC Error]:", data.error);
      throw new Error(data.error.data?.message || data.error.message || "Odoo RPC Error");
    }

    return data.result as T;
  } catch (err: any) {
    console.error("[Odoo Connection Failed]:", err);
    throw err;
  }
}

/**
 * Authenticate with Odoo instance and retrieve user ID
 */
export async function odooAuthenticate(): Promise<number> {
  if (cachedUid) return cachedUid;

  const uid = await odooCall<number>("common", "authenticate", [
    ODOO_DB,
    ODOO_USER,
    ODOO_PASS,
    {},
  ]);

  if (!uid) {
    throw new Error("Invalid Odoo credentials");
  }

  cachedUid = uid;
  return uid;
}

/**
 * Execute ORM call using execute_kw
 */
export async function odooExecute<T = any>(
  model: string,
  method: string,
  args: any[] = [],
  kwargs: Record<string, any> = {}
): Promise<T> {
  const uid = await odooAuthenticate();
  return odooCall<T>("object", "execute_kw", [
    ODOO_DB,
    uid,
    ODOO_PASS,
    model,
    method,
    args,
    kwargs,
  ]);
}

/**
 * Convenience method to search and read records from an Odoo model
 */
export async function odooSearchRead<T = any>(
  model: string,
  domain: any[] = [],
  fields: string[] = [],
  limit = 50,
  order = "id desc"
): Promise<T[]> {
  return odooExecute<T[]>(model, "search_read", [domain], {
    fields,
    limit,
    order,
  });
}

/**
 * Create a new record in Odoo
 */
export async function odooCreate(model: string, values: Record<string, any>): Promise<number> {
  return odooExecute<number>(model, "create", [values]);
}

/**
 * Update an existing record in Odoo
 */
export async function odooWrite(
  model: string,
  ids: number | number[],
  values: Record<string, any>
): Promise<boolean> {
  const targetIds = Array.isArray(ids) ? ids : [ids];
  return odooExecute<boolean>(model, "write", [targetIds, values]);
}

/**
 * Specific Odoo operational helpers
 */
export const odoo = {
  // Stock Picking (Delivery Orders & Receipts)
  pickings: {
    list: (type?: "incoming" | "outgoing" | "internal", limit = 20) => {
      const domain = type ? [["picking_type_code", "=", type]] : [];
      return odooSearchRead("stock.picking", domain, [
        "name",
        "partner_id",
        "origin",
        "picking_type_code",
        "state",
        "scheduled_date",
        "date_done",
        "carrier_tracking_ref",
      ], limit);
    },
    validate: (pickingId: number) => {
      return odooExecute("stock.picking", "button_validate", [[pickingId]]);
    },
  },

  // Sales Orders
  sales: {
    list: (limit = 20) => {
      return odooSearchRead("sale.order", [], [
        "name",
        "partner_id",
        "date_order",
        "amount_total",
        "amount_tax",
        "state",
        "invoice_status",
        "delivery_status",
      ], limit);
    },
    confirm: (orderId: number) => {
      return odooExecute("sale.order", "action_confirm", [[orderId]]);
    },
    createInvoice: (orderId: number) => {
      return odooExecute("sale.order", "_create_invoices", [[orderId]]);
    },
  },

  // Customers & Vendors
  partners: {
    list: (limit = 30) => {
      return odooSearchRead("res.partner", [], [
        "name",
        "email",
        "phone",
        "city",
        "customer_rank",
        "supplier_rank",
        "total_invoiced",
      ], limit);
    },
    create: (values: { name: string; email?: string; phone?: string; street?: string; city?: string }) => {
      return odooCreate("res.partner", values);
    },
  },

  // Invoices & Accounting
  invoices: {
    list: (type: "out_invoice" | "in_invoice" = "out_invoice", limit = 20) => {
      return odooSearchRead("account.move", [["move_type", "=", type]], [
        "name",
        "partner_id",
        "invoice_date",
        "invoice_date_due",
        "amount_total",
        "amount_tax",
        "amount_residual",
        "state",
        "payment_state",
      ], limit);
    },
    post: (moveId: number) => {
      return odooExecute("account.move", "action_post", [[moveId]]);
    },
  },
};
