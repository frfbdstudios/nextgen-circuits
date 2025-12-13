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
const reports: Array<{
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  status: string;
}> = [];

export function RecentReportsTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Report Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Type</TableHead>
            <TableHead className="font-semibold text-gray-700">Generated Date</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                No reports found
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{report.name}</TableCell>
                <TableCell className="text-gray-700">{report.type}</TableCell>
                <TableCell className="text-gray-700">{report.generatedDate}</TableCell>
                <TableCell className="text-gray-700">{report.status}</TableCell>
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

