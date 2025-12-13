"use server";

import { getServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveDeliveryDetails(formData: {
  recipient_name: string;
  recipient_phone: string;
  recipient_secondary_phone?: string;
  recipient_address: string;
  special_instruction?: string;
}) {
  try {
    const supabase = await getServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if delivery details already exist
    const { data: existing } = await supabase
      .from("delivery_details")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("delivery_details")
        .update({
          recipient_name: formData.recipient_name,
          recipient_phone: formData.recipient_phone,
          recipient_secondary_phone: formData.recipient_secondary_phone || null,
          recipient_address: formData.recipient_address,
          special_instruction: formData.special_instruction || null,
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from("delivery_details")
        .insert({
          user_id: user.id,
          recipient_name: formData.recipient_name,
          recipient_phone: formData.recipient_phone,
          recipient_secondary_phone: formData.recipient_secondary_phone || null,
          recipient_address: formData.recipient_address,
          special_instruction: formData.special_instruction || null,
          is_default: true,
        });

      if (error) throw error;
    }

    revalidatePath("/user/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving delivery details:", error);
    return { success: false, error: error.message };
  }
}