

import React, { useEffect, useState } from "react";
import LeadTable from "../components/LeadTable";
import { Download, FileText, TrendingUp } from "lucide-react";
import { getLeads } from "../../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLeads();
        setLeads(res.data.leads || []);
      } catch (err) {
        console.log("");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = leads;
    if (filter !== "All") result = result.filter(l => l.source === filter);
    if (search) {
      result = result.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search)
      );
    }
    setFilteredLeads(result);

    
  }, [leads, filter, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);


  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const stats = {
    total: leads.length,
    website: leads.filter(l => l.source === "Website").length,
    meta: leads.filter(l => l.source === "Meta").length,
    google: leads.filter(l => l.source === "Google").length,
    today: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length
  };

  // EXPORT CSV
  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLeads.map(l => ({
      Name: l.name,
      Email: l.email,
      Phone: l.phone,
      Source: l.source,
      // Campaign: l.campaign || "-",
      Service: l.service || "-",
      Date: new Date(l.createdAt).toLocaleString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `urban-cruise-leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };




  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // === HEADER ===
    doc.setFillColor(124, 58, 237); // Purple Gradient Base
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Urban Cruise LMS - Lead Report", 15, 20);

    // === SUBHEADER (Date & Summary Info) ===
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 15, 40);

    // === SUMMARY BAR ===
    doc.setFillColor(245, 243, 255);
    doc.roundedRect(12, 45, pageWidth - 24, 14, 3, 3, "F");
    doc.setTextColor(88, 28, 135);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `Total: ${stats.total}  |  Website: ${stats.website}  |  Meta: ${stats.meta}  |  Google: ${stats.google}  |  Today: ${stats.today}`,
      20,
      54
    );

    // === TABLE ===
    autoTable(doc, {
      startY: 65,
      head: [[
        "Name",
        "Email",
        "Phone",
        "Source",
        "Service",
        "Date",
      ]],
      body: filteredLeads.map((l) => [
        l.name || "-",
        l.email || "-",
        l.phone || "-",
        l.source || "-",
        l.service || "-",
        new Date(l.createdAt).toLocaleDateString("en-IN"),
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [230, 230, 230],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 48 },
        2: { cellWidth: 30 },
        3: {
          cellWidth: 25,
          halign: "center",
          fontStyle: "bold",
          textColor: [255, 255, 255],
        },
        4: { cellWidth: 35 },
        5: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (data) => {
        // Source-based color coding
        if (data.section === "body" && data.column.index === 3) {
          const val = data.cell.raw;
          if (val === "Meta") data.cell.styles.fillColor = [236, 72, 153];
          else if (val === "Google") data.cell.styles.fillColor = [34, 197, 94];
          else data.cell.styles.fillColor = [59, 130, 246];
        }
      },
      alternateRowStyles: { fillColor: [252, 252, 255] },
      margin: { left: 8, right: 12 },
      didDrawPage: (data) => {
        // === WATERMARK ===
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));
        doc.setFontSize(50);
        doc.setTextColor(180, 180, 180);
        doc.setFont("helvetica", "bold");
        doc.text("URBAN CRUISE", 30, pageHeight / 1.8, { angle: 45 });
        doc.restoreGraphicsState();

        // === PAGE NUMBER ===
        doc.setFontSize(9);
        doc.setTextColor(120);
        const pageNumber = doc.internal.getNumberOfPages();
        doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
      },
    });

    // === FOOTER ===
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    doc.text("© 2025 Urban Cruise LMS — All Rights Reserved", 15, finalY);
    doc.text("Powered by Meta, Google & Website Forms", 15, finalY + 6);

    // === SAVE ===
    doc.save(`urban-cruise-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };


  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-linear-to-r
 from-purple-800 via-indigo-800 to-indigo-900 text-center px-6 py-4 shadow-md rounded-b-2xl">
        <h1 className="text-3xl font-bold text-white tracking-wide">Urban Cruise LMS</h1>
        <p className="text-base text-indigo-200 mt-1">Automated Lead Management System</p>
      </header>


      {/* Stats */}
      <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6">
        {["Total", "Website", "Meta", "Google", "Today"].map((key, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl border-l-4" style={{ borderColor: i === 0 ? "#a855f7" : i === 1 ? "#3b82f6" : i === 2 ? "#ec4899" : i === 3 ? "#10b981" : "#f59e0b" }}>
            <p className="text-gray-400">{key} Leads</p>
            <p className="text-4xl font-bold">{stats[key.toLowerCase()]}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="px-8 flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="Search..." className="px-4 py-3 bg-gray-800 rounded-lg w-80" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="px-4 cursor-pointer py-3 bg-gray-800 rounded-lg" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All Sources</option>
          <option value="Website">Website</option>
          <option value="Meta">Meta</option>
          <option value="Google">Google</option>
        </select>
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer font-bold ">
          <Download size={20} /> Excel
        </button>
        <button onClick={exportPDF} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2 font-bold cursor-pointer">
          <FileText size={20} /> PDF Report
        </button>
      </div>

      {/* Table */}
      <div className="p-8">
        <LeadTable leads={paginatedLeads} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 pb-10">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-5 py-3 bg-gray-700 rounded-lg disabled:opacity-50 cursor-pointer">Previous</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => goToPage(i + 1)} className={`w-12 h-12 rounded-lg font-bold ${currentPage === i + 1 ? "bg-purple-600 cursor-pointer" : "bg-gray-700 cursor-pointer"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-5 py-3 bg-gray-700 rounded-lg disabled:opacity-50 cursor-pointer">Next</button>
        </div>
      )}

      {/* Live Alert */}
      {leads.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-linear-to-r
 from-green-600 to-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl animate-bounce">
          <div className="font-bold text-lg">NEW LEAD!</div>
          <div>{leads[0].name} • {leads[0].source}</div>
        </div>
      )}
    </div>
  );
}