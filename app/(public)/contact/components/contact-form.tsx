"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  subject: z.string(),
  message: z.string().min(5, "Message should be at least 5 characters"),
})

export default function ContactForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    console.log(values)
    // handle submission logic (e.g. API call)
    setTimeout(() => {
      setLoading(false)
      form.reset()
    }, 1000)
  }

  return (
    <Card className="border-0 rounded-sm" style={{ backgroundColor: 'var(--background)', boxShadow: '0 2px 8px var(--shadow-medium)' }}>
      <CardContent className="p-8 flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 relative pb-3" style={{ color: 'var(--heading-blue)' }}>
          Send Us a Message
          <span className="absolute left-0 bottom-0 w-14 h-[3px]" style={{ backgroundColor: 'var(--accent-cyan)' }} />
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      className="w-full rounded-none focus:outline-none focus:ring-0"
                      style={{ borderColor: 'var(--border-light)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-cyan)' }}
                      // onBlur={(e) => { e.target.style.borderColor = 'var(--border-light)' }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder=""
                        className="w-full p3 rounded-none"
                        style={{ borderColor: 'var(--border-light)' }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-cyan)' }}
                        // onBlur={(e) => { e.target.style.borderColor = 'var(--border-light)' }}
                        {...field}
                      />
                      </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder=""
                      className="w-full rounded-none focus:outline-none focus:ring-0"
                      style={{ borderColor: 'var(--border-light)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-cyan)' }}
                      // onBlur={(e) => { e.target.style.borderColor = 'var(--border-light)' }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-none focus:outline-none focus:ring-0" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--input)' }}>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="order">Order Status</SelectItem>
                      <SelectItem value="returns">Returns & Refunds</SelectItem>
                      <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="w-full h-44 min-h-40 rounded-none focus:outline-none focus:ring-0 resize-vertical"
                      style={{ borderColor: 'var(--border-light)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-cyan)' }}
                      // onBlur={(e) => { e.target.style.borderColor = 'var(--border-light)' }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-md font-medium rounded-none mt-auto text-white"
                style={{ backgroundColor: 'var(--accent-cyan)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-cyan-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-cyan)' }}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
