// src/components/LeadTable.jsx
import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import { MessageSquare } from "lucide-react";

export default function LeadTable({ leads }) {
  return (
    <div className="overflow-hidden rounded-lg shadow-xl">
      <table className="min-w-full overflow-hidden bg-gray-800 border border-gray-700">
        <thead className="bg-linear-to-r
 from-purple-700 to-indigo-800 text-white">
          <tr>
            <th className="p-4 text-left font-bold">Name</th>
            <th className="p-2 text-left font-bold">Email</th>
            <th className="p-2 text-left font-bold">Phone</th>
            <th className="p-4 text-left font-bold">Service</th>
            <th className="p-2 text-left font-bold">Source</th>
            <th className="p-4 text-left font-bold">Campaign / Keyword</th>
            <th className="p-4 text-left font-bold">Platform / Ad</th>
            <th className="p-4 text-left font-bold">Message</th>
            <th className="p-4 text-left font-bold">Status</th>
            <th className="p-4 text-left font-bold">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {leads.length === 0 ? (
            <tr>
              <td colSpan="10" className="p-16 text-center text-gray-400 text-xl">
                No leads found
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-700 transition">
                <td className="p-4 font-semibold">{lead.name}</td>
                <td className="p-2 text-sm">{lead.email}</td>
                <td className="p-2 text-sm">{lead.phone}</td>
                <td className="p-4">
                  <span className="bg-blue-900 text-blue-200 text-nowrap px-4 py-1 rounded-full text-xs font-medium">
                    {lead.service || "N/A"}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold text-white ${lead.source === "Website" ? "bg-purple-600" :
                    lead.source === "Meta" ? "bg-pink-600" : "bg-green-600"
                    }`}>
                    {lead.source}
                  </span>
                </td>
                <td className="p-4 text-sm max-w-xs truncate">
                  {lead.source === "Google" ? (
                    <span className="text-green-400 font-medium">"{lead.keyword}"</span>
                  ) : (
                    lead.campaign || "-"
                  )}
                </td>
                <td className="p-4 text-xs">
                  {lead.source === "Meta" ? (
                    <div>
                      <span className="text-pink-400 font-medium">{lead.platform || "FB"}</span>
                      <div className="text-gray-400 truncate max-w-32">
                        {lead.adName || lead.formName || "-"}
                      </div>
                    </div>
                  ) : lead.source === "Google" ? (
                    <span className="text-green-400">Lead Form</span>
                  ) : (
                    <span className="text-purple-400">Website Form</span>
                  )}
                </td>
                <td className="p-4 text-sm max-w-xs">
                  {lead.message ? (
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-500" />
                      <span className="truncate">
                        {lead.message?.length > 15
                          ? lead.message.substring(0, 15) + "..."
                          : lead.message}
                      </span>

                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${lead.status === "New" ? "bg-yellow-600" :
                    lead.status === "Converted" ? "bg-emerald-600" :
                      lead.status === "Lost" ? "bg-red-600" : "bg-gray-600"
                    }`}>
                    {lead.status || "New"}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {formatInTimeZone(new Date(lead.createdAt), "Asia/Kolkata", "dd MMM, hh:mm a")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}