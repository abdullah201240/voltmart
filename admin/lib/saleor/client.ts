/**
 * Saleor Core GraphQL API Client
 * Connects to live Saleor Core backend (http://localhost:8081/graphql/)
 */

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || "http://localhost:8081/graphql/";

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; locations?: any[]; path?: string[]; extensions?: any }>;
}

export interface SaleorAuthSession {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    isStaff: boolean;
  };
}

let cachedSession: SaleorAuthSession | null = null;

export async function saleorFetch<T = any>(
  query: string,
  variables: Record<string, any> = {},
  options: { token?: string; channel?: string } = {}
): Promise<GraphQLResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = options.token || cachedSession?.token;
  if (token) {
    headers["Authorization"] = `JWT ${token}`;
  }

  if (options.channel) {
    headers["Saleor-Channel"] = options.channel;
  }

  try {
    const res = await fetch(SALEOR_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error from Saleor API: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("[Saleor GraphQL Error]:", error);
    return {
      errors: [{ message: error.message || "Network error connecting to Saleor Core" }],
    };
  }
}

/**
 * Authenticate staff user against Saleor Core
 */
export async function authenticateStaff(
  email = process.env.SALEOR_ADMIN_EMAIL || "admin@example.com",
  password = process.env.SALEOR_ADMIN_PASSWORD || "Admin@12345"
): Promise<SaleorAuthSession | null> {
  const query = `
    mutation TokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
        refreshToken
        user {
          id
          email
          isStaff
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const res = await saleorFetch<{ tokenCreate: any }>(query, { email, password });
  const data = res.data?.tokenCreate;

  if (data?.token && data.user?.isStaff) {
    cachedSession = {
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
    };
    return cachedSession;
  }

  return null;
}

/**
 * Get active channels from Saleor
 */
export async function getSaleorChannels(token?: string) {
  const query = `
    query GetChannels {
      channels {
        id
        name
        slug
        currencyCode
        isActive
      }
    }
  `;
  const res = await saleorFetch(query, {}, { token });
  return res.data?.channels || [];
}

/**
 * Fetch products from Saleor Core
 */
export async function getSaleorProducts(channel = "default-channel", first = 20) {
  const query = `
    query GetProducts($channel: String!, $first: Int!) {
      products(first: $first, channel: $channel) {
        edges {
          node {
            id
            name
            slug
            description
            thumbnail {
              url
              alt
            }
            category {
              id
              name
            }
            pricing {
              priceRange {
                start {
                  gross {
                    amount
                    currency
                  }
                }
              }
            }
            variants {
              id
              name
              sku
              quantityAvailable
            }
          }
        }
      }
    }
  `;
  const res = await saleorFetch(query, { channel, first });
  return (res.data?.products?.edges || []).map((e: any) => e.node);
}

/**
 * Fetch orders from Saleor Core
 */
export async function getSaleorOrders(first = 20, token?: string) {
  const query = `
    query GetOrders($first: Int!) {
      orders(first: $first) {
        edges {
          node {
            id
            number
            created
            status
            paymentStatus
            total {
              gross {
                amount
                currency
              }
            }
            user {
              id
              email
              firstName
              lastName
            }
            lines {
              id
              productName
              quantity
              unitPrice {
                gross {
                  amount
                  currency
                }
              }
            }
          }
        }
      }
    }
  `;
  const res = await saleorFetch(query, { first }, { token });
  return (res.data?.orders?.edges || []).map((e: any) => e.node);
}
