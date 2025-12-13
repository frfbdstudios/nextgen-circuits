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
const contents: Array<{
  id: string;
  title: string;
  category: string;
  author: string;
  status: string;
  publishedDate: string;
  views: string;
}> = [];

export function ContentTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Title</TableHead>
            <TableHead className="font-semibold text-gray-700">Category</TableHead>
            <TableHead className="font-semibold text-gray-700">Author</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Published Date</TableHead>
            <TableHead className="font-semibold text-gray-700">Views</TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                No content found
              </TableCell>
            </TableRow>
          ) : (
            contents.map((content) => (
              <TableRow key={content.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{content.title}</TableCell>
                <TableCell className="text-gray-700">{content.category}</TableCell>
                <TableCell className="text-gray-700">{content.author}</TableCell>
                <TableCell className="text-gray-700">{content.status}</TableCell>
                <TableCell className="text-gray-700">{content.publishedDate}</TableCell>
                <TableCell className="text-gray-700">{content.views}</TableCell>
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

