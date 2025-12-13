"use client";

import { useState, useEffect } from "react";
import { Truck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

export function DeliveryDetails() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_phone: '',
    recipient_secondary_phone: '',
    recipient_address: '',
    special_instruction: '',
  });

  useEffect(() => {
    fetchDeliveryDetails();
  }, []);

  const fetchDeliveryDetails = async () => {
    const supabase = getBrowserSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setFetchingData(false);
      return;
    }

    const { data, error } = await supabase
      .from("delivery_details")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single();

    if (data) {
      setFormData({
        recipient_name: data.recipient_name || '',
        recipient_phone: data.recipient_phone || '',
        recipient_secondary_phone: data.recipient_secondary_phone || '',
        recipient_address: data.recipient_address || '',
        special_instruction: data.special_instruction || '',
      });
    }

    setFetchingData(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getBrowserSupabaseClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        setLoading(false);
        return;
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
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        toast.success("Delivery details updated successfully!");
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
        toast.success("Delivery details saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving delivery details:", error);
      toast.error(error.message || "Failed to save delivery details");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">Loading delivery details...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-5 text-[#3498db]" />
          Delivery Information
        </CardTitle>
        <CardDescription>
          Enter your delivery details for faster checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient_name">Full Name *</Label>
            <Input
              id="recipient_name"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient_phone">Phone Number *</Label>
              <Input
                id="recipient_phone"
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                required
                pattern="^01[0-9]{9}$"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground mt-1">
                11 digit mobile number
              </p>
            </div>

            <div>
              <Label htmlFor="recipient_secondary_phone">
                Secondary Phone (Optional)
              </Label>
              <Input
                id="recipient_secondary_phone"
                name="recipient_secondary_phone"
                value={formData.recipient_secondary_phone}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                pattern="^01[0-9]{9}$"
                maxLength={11}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="recipient_address">Delivery Address *</Label>
            <Textarea
              id="recipient_address"
              name="recipient_address"
              value={formData.recipient_address}
              onChange={handleInputChange}
              placeholder="House/Flat, Road, Area, City, Postal Code"
              required
              minLength={10}
              maxLength={220}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Please provide complete address (10-220 characters)
            </p>
          </div>

          <div>
            <Label htmlFor="special_instruction">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="special_instruction"
              name="special_instruction"
              value={formData.special_instruction}
              onChange={handleInputChange}
              placeholder="Any special delivery instructions..."
              rows={2}
              maxLength={500}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                These details will be used as default for all your future orders. 
                You can always update them later or modify during checkout.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-[#3498db] hover:bg-[#2980b9] text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

