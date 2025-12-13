"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketCard } from "./ticket-card";

const tickets = [
  {
    id: "1043",
    title: "Order not received after 5 days",
    customer: "John Smith",
    date: "Oct 15, 2023",
    description: "I placed an order 5 days ago (Order #10583) and haven't received any shipping confirmation...",
    status: "Open" as const,
  },
  {
    id: "1042",
    title: "Defective microcontroller in my order",
    customer: "Sarah Johnson",
    date: "Oct 14, 2023",
    description: "The Arduino Nano in my order appears to be defective. When I connect it to my computer...",
    status: "In Progress" as const,
  },
  {
    id: "1041",
    title: "Question about product compatibility",
    customer: "Michael Chen",
    date: "Oct 12, 2023",
    description: "I'm working on a project and need to know if the Raspberry Pi 4 is compatible with...",
    status: "Resolved" as const,
  },
];

export function TicketsSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Customer Support Tickets</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select defaultValue="all-tickets">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Tickets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-tickets">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} {...ticket} />
        ))}
      </div>
    </div>
  );
}

