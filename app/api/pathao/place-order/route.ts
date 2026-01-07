import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

interface PathaoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PathaoOrderRequest {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_secondary_phone?: string;
  recipient_address: string;
  recipient_city?: number;
  recipient_zone?: number;
  recipient_area?: number;
  delivery_type: 48 | 12; // 48 for Normal, 12 for On Demand
  item_type: 1 | 2; // 1 for Document, 2 for Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number;
  item_description?: string;
  amount_to_collect: number;
}

interface PathaoOrderResponse {
  message: string;
  type: string;
  code: number;
  data: {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
  };
}

async function getPathaoAccessToken(): Promise<string> {
  const tokenResponse = await fetch(
    `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        username: process.env.PATHAO_EMAIL,
        password: process.env.PATHAO_PASSWORD,
        grant_type: "password",
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Pathao access token");
  }

  const tokenData: PathaoTokenResponse = await tokenResponse.json();
  return tokenData.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabaseClient();
    
    // Get the order ID from the request body
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already placed in Pathao
    if (order.pathao_consignment_id) {
      return NextResponse.json(
        { error: "Order already placed in Pathao", consignment_id: order.pathao_consignment_id },
        { status: 400 }
      );
    }

    // Check if order status is confirmed
    if (order.status !== "confirmed") {
      return NextResponse.json(
        { error: "Order must be confirmed before placing in Pathao" },
        { status: 400 }
      );
    }

    // Get Pathao access token
    const accessToken = await getPathaoAccessToken();

    // Prepare order data for Pathao
    const pathaoOrderData: PathaoOrderRequest = {
      store_id: parseInt(process.env.PATHAO_STORE_ID || "0"),
      merchant_order_id: order.merchant_order_id || order.id,
      recipient_name: order.recipient_name,
      recipient_phone: order.recipient_phone,
      recipient_secondary_phone: order.recipient_secondary_phone || undefined,
      recipient_address: order.recipient_address,
      delivery_type: 48, // Normal delivery
      item_type: 2, // Parcel
      special_instruction: order.special_instruction || undefined,
      item_quantity: order.item_quantity,
      item_weight: parseFloat(order.item_weight.toString()),
      item_description: `Order #${order.id.slice(0, 8)} - ${order.item_quantity} items`,
      amount_to_collect: order.payment_method === "cod" ? Math.round(parseFloat(order.total.toString())) : 0,
    };

    // Place order in Pathao
    const pathaoResponse = await fetch(
      `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(pathaoOrderData),
      }
    );

    if (!pathaoResponse.ok) {
      const errorData = await pathaoResponse.json();
      console.error("Pathao API error:", errorData);
      return NextResponse.json(
        { error: "Failed to place order in Pathao", details: errorData },
        { status: pathaoResponse.status }
      );
    }

    const pathaoData: PathaoOrderResponse = await pathaoResponse.json();

    // Update order in database with Pathao details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        pathao_consignment_id: pathaoData.data.consignment_id,
        pathao_order_status: pathaoData.data.order_status,
        merchant_order_id: pathaoData.data.merchant_order_id,
        delivery_fee: pathaoData.data.delivery_fee,
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return NextResponse.json(
        { 
          error: "Order placed in Pathao but failed to update database",
          pathao_data: pathaoData.data 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order placed in Pathao successfully",
      data: pathaoData.data,
    });

  } catch (error) {
    console.error("Error placing order in Pathao:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}