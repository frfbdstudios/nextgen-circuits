"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Empty table matching the image
const campaigns: Array<{
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: string;
  performance: string;
}> = [];

export function MarketingTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Campaign Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Type</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Start Date</TableHead>
            <TableHead className="font-semibold text-gray-700">End Date</TableHead>
            <TableHead className="font-semibold text-gray-700">Budget</TableHead>
            <TableHead className="font-semibold text-gray-700">Performance</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{campaign.name}</TableCell>
                <TableCell className="text-gray-700">{campaign.type}</TableCell>
                <TableCell className="text-gray-700">{campaign.status}</TableCell>
                <TableCell className="text-gray-700">{campaign.startDate}</TableCell>
                <TableCell className="text-gray-700">{campaign.endDate}</TableCell>
                <TableCell className="text-gray-700">{campaign.budget}</TableCell>
                <TableCell className="text-gray-700">{campaign.performance}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Actions would go here */}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

