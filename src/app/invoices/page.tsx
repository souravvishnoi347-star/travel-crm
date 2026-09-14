"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Download, 
  Loader2, 
  MessageCircle, 
  FileText, 
  Calendar, 
  User, 
  IndianRupee, 
  RotateCcw,
  Maximize2, 
  Minimize2,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveDocumentToHub } from "@/lib/documentsHub";

function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  let numStr = Math.floor(num).toString();
  if (numStr.length > 9) return "Amount too large";
  const n = ("000000000" + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ""; 
  let str = "";
  str += (n[1] != "00") ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += (n[2] != "00") ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += (n[3] != "00") ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += (n[4] != "0") ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += (n[5] != "00") ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) + "Rupees Only" : "Rupees Only";
  return str;
}

const DEFAULT_INVOICE_DATA = {
  companySettings: "Travel to Uttarakhand",
  invoiceNumber: "INV-2026-0001",
  guestName: "",
  guestPhone: "",
  guestEmail: "",
  guestGst: "",
  dateType: "Travel Date",
  travelDate: "",
  bookingDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  packages: [
    { 
      detail: "Tour Package Booking / Chardham Yatra Service", 
      person: 1, 
      rate: 0, 
      amount: 0 
    }
  ],
  taxPercent: "5",
  discount: "0",
  amountPaid: "0",
  bankName: "Central Bank of India",
  accountHolder: "Travel to Uttarakhand",
  accountNumber: "5242273759",
  ifscCode: "CBIN0280274",
  accountType: "Current Account",
  branchName: "Haridwar Branch",
  upiId: "",
  showUpiQr: true,
  customQrUrl: "/qr_clean.png",
  notes: `Bank Details for Remittance:\n• Beneficiary: Travel to Uttarakhand\n• Bank Name: Central Bank of India\n• Account No: 5242273759\n• IFSC Code: CBIN0280274\n\nTerms & Payment Conditions:\n• Advance payment required prior to trip commencement.\n• Rates include all applicable toll taxes, parking fees, and driver allowances.\n• Cancellation and rescheduling are governed by partner hotel & transport policies.`
};

export default function InvoicesPage() {
  const [data, setData] = useState(DEFAULT_INVOICE_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
  const [showQrModal, setShowQrModal] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-fit screen and fit-width scaling
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const el = previewContainerRef.current;
      const padX = 40;
      const padY = 40;
      const availW = Math.max(300, el.clientWidth - padX);
      const availH = Math.max(300, el.clientHeight - padY);

      const scaleW = availW / 794;
      const scaleH = availH / 1122;

      if (fitMode === "width") {
        setAutoScale(Math.max(0.4, Math.min(1.3, Number(scaleW.toFixed(3)))));
      } else {
        const fitScale = Math.min(scaleW, scaleH);
        setAutoScale(Math.max(0.35, Math.min(0.95, Number(fitScale.toFixed(3)))));
      }
    };

    updateScale();
    const timer = setTimeout(updateScale, 150);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && previewContainerRef.current) {
      ro = new ResizeObserver(() => updateScale());
      ro.observe(previewContainerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
      if (ro) ro.disconnect();
    };
  }, [isFormCollapsed, fitMode]);

  // Load latest invoice from Supabase Cloud or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("triloki_invoice_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.packages?.length > 0) {
            // If cached data has older mock bank details, migrate to actual Central Bank of India details
            if (!parsed.accountNumber || parsed.accountNumber === "10180000573933") {
              parsed.bankName = "Central Bank of India";
              parsed.accountHolder = "Travel to Uttarakhand";
              parsed.accountNumber = "5242273759";
              parsed.ifscCode = "CBIN0280274";
              parsed.upiId = "";
            }
            if (!parsed.customQrUrl || parsed.customQrUrl === "/QR.jpg") {
              parsed.customQrUrl = "/qr_clean.png";
            }
            setData({ ...DEFAULT_INVOICE_DATA, ...parsed });
            return;
          }
        }

        // Fetch latest saved invoice from Supabase
        const fetchCloudInvoice = async () => {
          try {
            const { data: cloudInvoice } = await supabase
              .from("invoices")
              .select("document_data")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (cloudInvoice && cloudInvoice.document_data && Array.isArray((cloudInvoice.document_data as any).packages)) {
              const cloudData = cloudInvoice.document_data as any;
              if (!cloudData.accountNumber || cloudData.accountNumber === "10180000573933") {
                cloudData.bankName = "Central Bank of India";
                cloudData.accountHolder = "Travel to Uttarakhand";
                cloudData.accountNumber = "5242273759";
                cloudData.ifscCode = "CBIN0280274";
                cloudData.upiId = "";
              }
              if (!cloudData.customQrUrl || cloudData.customQrUrl === "/QR.jpg") {
                cloudData.customQrUrl = "/qr_clean.png";
              }
              setData({ ...DEFAULT_INVOICE_DATA, ...cloudData });
              localStorage.setItem("triloki_invoice_data", JSON.stringify(cloudData));
            }
          } catch {}
        };
        fetchCloudInvoice();
      } catch (e) {
        console.warn("Could not load invoice data:", e);
      }
    }
  }, []);

  const currentScale = manualZoom !== null ? manualZoom : autoScale;

  const handleZoomIn = () => {
    const next = Math.min(1.5, Number((currentScale + 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(0.35, Number((currentScale - 0.1).toFixed(2)));
    setManualZoom(next);
  };

  const handleSetFitMode = (mode: "screen" | "width") => {
    setFitMode(mode);
    setManualZoom(null);
  };

  const handlePackageChange = (index: number, field: string, value: string | number) => {
    const newPackages = [...data.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    
    if (field === 'person' || field === 'rate') {
      const person = Number(newPackages[index].person) || 0;
      const rate = Number(newPackages[index].rate) || 0;
      newPackages[index].amount = person * rate;
    }
    
    setData({ ...data, packages: newPackages });
  };

  const addPackage = () => {
    setData({
      ...data,
      packages: [...data.packages, { detail: "", person: 1, rate: 0, amount: 0 }]
    });
  };

  const removePackage = (index: number) => {
    setData({
      ...data,
      packages: data.packages.filter((_, i) => i !== index)
    });
  };

  const calculations = useMemo(() => {
    const subTotal = data.packages.reduce((sum, pkg) => sum + (Number(pkg.amount) || 0), 0);
    const discount = Number(data.discount) || 0;
    const afterDiscount = Math.max(0, subTotal - discount);
    const total = Math.round(afterDiscount);
    const paid = Number(data.amountPaid) || 0;
    const pending = total - paid;
    return { subTotal, discount, taxAmount: 0, total, paid, pending, totalWords: numberToWords(total) };
  }, [data.packages, data.discount, data.amountPaid]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("print-invoice");
      if (!element) {
        alert("Could not find the print container.");
        setIsDownloading(false);
        return;
      }

      // Save to Supabase Cloud
      try {
        if (data.guestName) {
          let clientId = null;
          if (data.guestPhone) {
            const { data: existingClient } = await supabase.from("clients").select("id").eq("phone", data.guestPhone).single();
            if (existingClient) clientId = existingClient.id;
          }
          if (!clientId) {
            const { data: newClient } = await supabase.from("clients").insert({
              name: data.guestName,
              phone: data.guestPhone || "",
              email: data.guestEmail || ""
            }).select().single();
            clientId = newClient?.id;
          }
          await supabase.from("invoices").insert({
            invoice_number: data.invoiceNumber,
            client_id: clientId,
            total_amount: calculations.total,
            document_data: data
          });
        }
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
      }

      // Record in local Document Hub
      try {
        saveDocumentToHub({
          id: `inv-${data.invoiceNumber || Date.now()}`,
          type: "invoice",
          title: `Tax Invoice - ${data.guestName || "Billing"}`,
          docNumber: data.invoiceNumber,
          guestName: data.guestName || "Valued Guest",
          guestPhone: data.guestPhone || "",
          travelDates: data.travelDate || data.bookingDate,
          amount: calculations.total,
          paidAmount: calculations.paid,
          pendingAmount: calculations.pending,
          detailsSummary: `Total: ₹${calculations.total.toLocaleString("en-IN")} | Advance: ₹${calculations.paid.toLocaleString("en-IN")} | Due: ₹${calculations.pending.toLocaleString("en-IN")}`,
          studioUrl: "/invoices",
          rawPayload: data
        });
      } catch (hubErr) {
        console.warn("Local hub save:", hubErr);
      }

      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF;

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false 
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Add clickable PDF link annotations
      try {
        const linkEls = element.querySelectorAll("a[href], [data-pdf-link]");
        const containerRect = element.getBoundingClientRect();
        linkEls.forEach((linkNode) => {
          const rect = linkNode.getBoundingClientRect();
          const targetUrl = linkNode.getAttribute("data-pdf-link") || (linkNode as HTMLAnchorElement).href;
          if (targetUrl && rect.width > 0 && rect.height > 0 && containerRect.width > 0 && containerRect.height > 0) {
            const x = ((rect.left - containerRect.left) / containerRect.width) * pdfWidth;
            const y = ((rect.top - containerRect.top) / containerRect.height) * pdfHeight;
            const w = (rect.width / containerRect.width) * pdfWidth;
            const h = (rect.height / containerRect.height) * pdfHeight;
            pdf.link(x, y, w, h, { url: targetUrl });
          }
        });
      } catch (linkErr) {
        console.warn("Could not attach PDF link annotations:", linkErr);
      }

      pdf.save(`Invoice_${data.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_")}_${data.guestName.replace(/\s+/g, "_")}.pdf`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*TAX INVOICE - TRAVEL TO UTTARAKHAND*\n\nDear ${data.guestName},\n\nPlease find your invoice details:\n• Invoice No: ${data.invoiceNumber}\n• Date: ${data.bookingDate}\n• Total Amount: ₹${calculations.total.toLocaleString("en-IN")}\n• Advance Received: ₹${calculations.paid.toLocaleString("en-IN")}\n• Balance Due: ₹${calculations.pending.toLocaleString("en-IN")}\n\nBank: ${data.bankName || "Central Bank of India"} | A/C: ${data.accountNumber || "5242273759"} | IFSC: ${data.ifscCode || "CBIN0280274"}${data.upiId ? ` | UPI: ${data.upiId}` : ""}\n\nThank you for choosing Travel to Uttarakhand!`;
    const encoded = encodeURIComponent(text);
    const phone = data.guestPhone ? data.guestPhone.replace(/[^0-9]/g, "") : "";
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  // Modular Page Renderer - Perfectly proportioned to fit exactly inside 1122px with zero cutoff
  const renderInvoiceContent = (prefix: string) => (
    <div 
      id={`${prefix}-invoice`} 
      className="w-[794px] h-[1122px] min-h-[1122px] max-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP SECTION */}
        <div className="space-y-3">
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center pb-1.5 border-b border-gray-200">
            <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain mb-1.5 drop-shadow-xs" />
            <p className="text-[11px] uppercase tracking-widest text-[#0369a1] font-bold">Travel to Uttarakhand</p>
            <h1 className="text-3xl font-serif font-black text-[#0369a1] tracking-tight mt-0.5 uppercase">
              TOUR INVOICE
            </h1>
            <p className="text-xs font-bold tracking-widest text-[#dc2626] uppercase mt-0.5">
              BILL OF SUPPLY & SERVICE VOUCHER
            </p>
            <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap justify-center gap-2">
              <span>Contact: <strong className="text-gray-700">+91 9719038278</strong></span>
              <span>·</span>
              <span>Email: <strong className="text-gray-700">info@traveltouttrakhand.com</strong></span>
              <span>·</span>
              <span>Website: <a href="https://traveltouttrakhand.com" target="_blank" rel="noopener noreferrer" data-pdf-link="https://traveltouttrakhand.com" className="text-[#0369a1] font-bold hover:underline">www.traveltouttrakhand.com</a></span>
            </div>
          </div>

          {/* Metadata Line */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-lg py-1 px-3.5 text-center text-[11px] font-semibold text-gray-800 flex justify-between items-center">
            <span>Invoice No: <strong className="text-[#0369a1] font-mono">{data.invoiceNumber}</strong></span>
            <span>Invoice Date: <strong className="text-gray-900">{data.bookingDate}</strong></span>
            <span>{data.dateType}: <strong className="text-gray-900">{data.travelDate}</strong></span>
          </div>

          {/* Dual Billed To / Billed By Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/60 space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Billed To (Client Particulars)</span>
              <h3 className="text-xs font-serif font-bold text-[#0369a1]">{data.guestName}</h3>
              {data.guestPhone && <p className="text-gray-700 text-[10px]">Phone: <strong className="text-gray-900">{data.guestPhone}</strong></p>}
              {data.guestEmail && <p className="text-gray-700 text-[10px]">Email: {data.guestEmail}</p>}
            </div>

            <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/60 space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Billed By (Service Provider)</span>
              <h3 className="text-xs font-serif font-bold text-[#0369a1]">{data.companySettings}</h3>
              <p className="text-gray-700 text-[10px]">Registered Office: Haridwar / Dehradun, Uttarakhand</p>
              <p className="text-gray-700 text-[10px]">Helpline: +91 9719038278</p>
            </div>
          </div>

          {/* Services & Packages Breakdown Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#0369a1] text-white text-[10.5px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-2.5 py-1.5 w-[8%] text-center">#</th>
                  <th className="px-3 py-1.5 w-[64%]">Description of Tour Services & Packages</th>
                  <th className="px-2.5 py-1.5 w-[14%] text-center">Pax / Qty</th>
                  <th className="px-3 py-1.5 w-[14%] text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[11px]">
                {data.packages.map((pkg, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    <td className="px-2.5 py-1.5 text-center text-gray-500 font-medium align-top">{idx + 1}</td>
                    <td className="px-3 py-1.5 text-gray-900 leading-snug font-medium align-top">{pkg.detail || "Custom Tour Package"}</td>
                    <td className="px-2.5 py-1.5 text-center text-gray-700 align-top">{pkg.person}</td>
                    <td className="px-3 py-1.5 text-right font-bold text-gray-900 align-top font-mono">₹{Number(pkg.amount || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Box */}
          <div className="grid grid-cols-[1fr_270px] gap-3 items-start text-xs">
            {/* Left: Total in Words & Payment Badges */}
            <div className="space-y-2">
              <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-2">
                <span className="text-[9px] uppercase font-bold text-sky-800 tracking-wider block">Total Amount in Words:</span>
                <p className="font-serif font-bold text-[#0369a1] text-[11px] italic mt-0.5 leading-snug">{calculations.totalWords}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider block">Advance Received</span>
                  <p className="text-xs font-bold text-emerald-700 font-mono mt-0.5">₹{calculations.paid.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                  <span className="text-[9px] uppercase font-bold text-rose-800 tracking-wider block">Balance Pending</span>
                  <p className="text-xs font-bold text-rose-700 font-mono mt-0.5">₹{calculations.pending.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Right: Calculations Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-200 text-[11px]">
                  <tr>
                    <td className="px-2.5 py-1 text-gray-600 font-medium">Subtotal:</td>
                    <td className="px-2.5 py-1 text-right font-mono font-semibold text-gray-900">₹{calculations.subTotal.toLocaleString("en-IN")}</td>
                  </tr>
                  {Number(data.discount) > 0 && (
                    <tr>
                      <td className="px-2.5 py-1 text-emerald-700 font-medium">Discount:</td>
                      <td className="px-2.5 py-1 text-right font-mono font-semibold text-emerald-700">-₹{calculations.discount.toLocaleString("en-IN")}</td>
                    </tr>
                  )}
                  <tr className="bg-[#0369a1] text-white">
                    <td className="px-2.5 py-1.5 font-bold uppercase tracking-wider text-[11px]">Grand Total:</td>
                    <td className="px-2.5 py-1.5 text-right font-bold text-xs font-mono">₹{calculations.total.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Particulars & UPI QR Code Box */}
          <div className="bg-gradient-to-r from-sky-50/60 via-blue-50/40 to-slate-50 border border-[#0369a1]/30 rounded-xl p-2.5 text-[10px] text-gray-800 flex items-center justify-between gap-3 shadow-2xs">
            {/* Left: Bank Details */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 pb-1 border-b border-sky-100">
                <Building2 className="w-3.5 h-3.5 text-[#0369a1]" />
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[9.5px]">
                  Official Bank Remittance Details
                </span>
                <span className="text-[8.5px] px-1.5 py-0.2 bg-sky-100 text-sky-800 font-semibold rounded">
                  {data.accountType || "Current Account"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px] pt-0.5">
                <div>
                  <span className="text-gray-500">Beneficiary: </span>
                  <strong className="text-gray-900 font-semibold">{data.accountHolder || "Travel to Uttarakhand"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Bank Name: </span>
                  <strong className="text-gray-900 font-semibold">{data.bankName || "Central Bank of India"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Account No: </span>
                  <strong className="font-mono text-gray-900 font-bold tracking-wider">{data.accountNumber || "5242273759"}</strong>
                </div>
                <div>
                  <span className="text-gray-500">IFSC Code: </span>
                  <strong className="font-mono text-gray-900 font-bold tracking-wider">{data.ifscCode || "CBIN0280274"}</strong>
                </div>
              </div>

              <div className="pt-0.5 flex items-center gap-2 text-[9px] text-gray-600 flex-wrap">
                {data.upiId && data.upiId.trim() ? (
                  <>
                    <span className="text-gray-500">UPI ID / VPA:</span>
                    <span className="font-mono font-bold text-[#0369a1] bg-white px-2 py-0.5 rounded border border-sky-200">
                      {data.upiId}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 font-medium">
                    UPI ID: <span className="text-gray-400 italic font-mono">______________</span>
                  </span>
                )}
                <span className="text-[8.5px] text-gray-400 italic ml-auto">• 100% full settlement required before start of travel</span>
              </div>
            </div>

            {/* Right: Scannable UPI QR Code */}
            {data.showUpiQr !== false && (
              <div 
                onClick={() => setShowQrModal(true)}
                className="shrink-0 flex flex-col items-center bg-white p-1.5 rounded-xl border border-sky-200 shadow-2xs cursor-pointer hover:border-sky-400 hover:shadow-md transition"
                title="Click to enlarge QR Code"
              >
                <div className="w-[96px] h-[96px] relative overflow-hidden rounded-lg bg-white flex items-center justify-center p-0.5">
                  <img
                    src={`${data.customQrUrl || "/qr_clean.png"}?v=5`}
                    alt="Official UPI Payment QR Code"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <p className="text-[8.5px] font-bold text-gray-800 leading-none">Scan to Pay via UPI</p>
                  <p className="text-[7px] text-sky-600 font-semibold mt-0.5">GPay · PhonePe · Paytm · BHIM</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Signatory & Page Footer */}
        <div className="space-y-2 pt-1 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="logo" className="h-11 w-auto object-contain" />
              <div>
                <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Issued By</p>
                <h4 className="text-xs font-serif font-bold text-[#0369a1]">Travel to Uttarakhand</h4>
                <p className="text-[9.5px] text-gray-600 font-medium">
                  Mr. Amit kumar · +91 9719038278 · 
                  <a 
                    href="https://traveltouttrakhand.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    data-pdf-link="https://traveltouttrakhand.com" 
                    className="text-[#0369a1] font-bold hover:underline ml-1"
                  >
                    traveltouttrakhand.com
                  </a>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#0369a1] font-serif font-bold tracking-widest">ॐ नमः शिवाय</p>
              <p className="text-[8.5px] uppercase tracking-wider text-gray-400 mt-0.5">Authorized Signatory</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-1 flex justify-between items-center text-[9.5px] text-gray-500">
            <span>Travel to Uttarakhand · +91 9719038278</span>
            <a 
              href="https://traveltouttrakhand.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-pdf-link="https://traveltouttrakhand.com" 
              className="font-bold text-[#0369a1] hover:underline"
            >
              🌐 www.traveltouttrakhand.com
            </a>
            <span>Tax Invoice · Page 1 of 1</span>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full h-[calc(100vh-5rem)]">
      
      {/* Left Column: Form Controls */}
      {!isFormCollapsed && (
        <div className="w-full lg:w-[38%] bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-y-auto shrink-0 h-full space-y-4 transition-all duration-300 custom-scrollbar">
          
          {/* Header with Title & Reset Button */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Tax Invoice Studio</h1>
                <p className="text-xs text-gray-500">Travel to Uttarakhand • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => setData(DEFAULT_INVOICE_DATA)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reset to default invoice data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Invoice Particulars */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Invoice Particulars</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Invoice No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-[#0369a1]" value={data.invoiceNumber} onChange={e => setData({ ...data, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Invoice Date</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.bookingDate} onChange={e => setData({ ...data, bookingDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Travel Dates</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.travelDate} onChange={e => setData({ ...data, travelDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 2. Client Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Billed To (Guest Particulars)</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Client / Guest Name</label>
                <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.guestName} onChange={e => setData({ ...data, guestName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Phone Number</label>
                  <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.guestPhone} onChange={e => setData({ ...data, guestPhone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Email</label>
                  <input type="email" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.guestEmail} onChange={e => setData({ ...data, guestEmail: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 3. Package & Services Items */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Package Items ({data.packages.length})</span>
                <button onClick={addPackage} className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 text-white text-[11px] font-semibold rounded-lg hover:bg-sky-700 transition-colors cursor-pointer">
                  <Plus size={12} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {data.packages.map((pkg, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded-lg space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0369a1] text-[11px]">Item {idx + 1}</span>
                      <button onClick={() => removePackage(idx)} className="text-gray-400 hover:text-rose-600 transition cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Description of Service</label>
                      <textarea rows={2} className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs leading-snug" value={pkg.detail} onChange={e => handlePackageChange(idx, 'detail', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Qty / Pax</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs" value={pkg.person} onChange={e => handlePackageChange(idx, 'person', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Rate (₹)</label>
                        <input type="number" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-semibold" value={pkg.rate} onChange={e => handlePackageChange(idx, 'rate', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Amount (₹)</label>
                        <div className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-bold text-gray-800">₹{pkg.amount.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Discount & Advance Settlement */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Discount & Advance Settlement</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Discount (₹)</label>
                  <input type="number" className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono" value={data.discount} onChange={e => setData({ ...data, discount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Advance Paid (₹)</label>
                  <input type="number" className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-emerald-600" value={data.amountPaid} onChange={e => setData({ ...data, amountPaid: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 5. Bank Account & UPI Payment Settings */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Bank Account & UPI QR
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={data.showUpiQr !== false}
                    onChange={e => setData({ ...data, showUpiQr: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-[11px] font-semibold text-gray-700">Show QR</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Beneficiary / Holder</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium"
                    value={data.accountHolder ?? "Travel to Uttarakhand"}
                    onChange={e => setData({ ...data, accountHolder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Bank Name</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium"
                    value={data.bankName ?? "Central Bank of India"}
                    onChange={e => setData({ ...data, bankName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold"
                    value={data.accountNumber ?? "5242273759"}
                    onChange={e => setData({ ...data, accountNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">IFSC Code</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold uppercase"
                    value={data.ifscCode ?? "CBIN0280274"}
                    onChange={e => setData({ ...data, ifscCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-[#0369a1] font-bold"
                    value={data.upiId ?? ""}
                    onChange={e => setData({ ...data, upiId: e.target.value })}
                    placeholder="Leave blank or enter later"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Account Type</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                    value={data.accountType ?? "Current Account"}
                    onChange={e => setData({ ...data, accountType: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">QR Code Image Path / URL</label>
                <input
                  type="text"
                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono"
                  placeholder="/qr_clean.png"
                  value={data.customQrUrl ?? "/qr_clean.png"}
                  onChange={e => setData({ ...data, customQrUrl: e.target.value })}
                />
                <p className="text-[9px] text-gray-400 mt-0.5">
                  Official high-resolution UPI QR code (/qr_clean.png) loaded from your project folder.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Right Column: Live Centered Preview */}
      <div className={`flex flex-col gap-3 transition-all duration-300 h-full ${isFormCollapsed ? "w-full" : "w-full lg:w-[62%]"}`}>
        
        {/* Sleek Toolbar */}
        <div className="bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Left: Collapse & Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition cursor-pointer"
              title={isFormCollapsed ? "Show Edit Form" : "Expand Full Preview"}
            >
              {isFormCollapsed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-gray-700 text-[11px] min-w-[42px] text-center">
                {Math.round(currentScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Fit Mode Buttons */}
            <button
              onClick={() => handleSetFitMode("width")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "width" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Zoom to Fit Width (Enlarged & Easy to Read)"
            >
              Fit Width
            </button>

            <button
              onClick={() => handleSetFitMode("screen")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                fitMode === "screen" && manualZoom === null
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="Fit Full Page on Screen"
            >
              Fit Page
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0369a1] hover:bg-[#025684] text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Centered Preview Viewport */}
        <div 
          ref={previewContainerRef}
          className="w-full flex-1 overflow-auto bg-slate-200/90 p-4 rounded-2xl flex flex-col items-center justify-start custom-scrollbar relative"
        >
          <div
            style={{
              width: `${Math.round(794 * currentScale)}px`,
              minHeight: `${Math.round(1122 * currentScale)}px`,
              transition: "width 0.15s ease-out, min-height 0.15s ease-out"
            }}
            className="relative shrink-0 flex flex-col items-center shadow-lg"
          >
            <div
              style={{
                transform: `scale(${currentScale})`,
                transformOrigin: "top left",
                width: "794px",
                position: "absolute",
                top: 0,
                left: 0,
                transition: "transform 0.15s ease-out"
              }}
            >
              {renderInvoiceContent("view")}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Print Container for High-Res PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderInvoiceContent("print")}
      </div>

      {/* Full-Size QR Scanner Modal for Instant Screen Scanning */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full pb-2 border-b border-gray-100">
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-sm">Official UPI Payment QR</h3>
                <p className="text-xs text-[#0369a1] font-semibold">Travel to Uttarakhand</p>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center text-base font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border-2 border-sky-200 rounded-2xl shadow-inner flex items-center justify-center">
              <img
                src={`${data.customQrUrl || "/qr_clean.png"}?v=5`}
                alt="Full Size UPI QR Code"
                className="w-64 h-64 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <div className="space-y-1.5 text-xs text-gray-600 w-full bg-sky-50/50 p-3 rounded-xl border border-sky-100">
              <p className="font-bold text-gray-900">Scan using any UPI App</p>
              <p className="text-[11px] text-sky-700 font-medium">Google Pay · PhonePe · Paytm · BHIM · Cred</p>
              <div className="pt-2 text-[11px] text-left border-t border-sky-100 mt-2 space-y-0.5">
                <p><span className="text-gray-500 font-medium">Merchant UPI:</span> <span className="font-mono font-bold text-[#0369a1] select-all">20251232406374-iservuqrsbrp@cbin</span></p>
                <p><span className="text-gray-500 font-medium">Bank Name:</span> <strong className="text-gray-900 font-semibold">Central Bank of India</strong></p>
                <p><span className="text-gray-500 font-medium">Account No:</span> <strong className="font-mono text-gray-900 font-bold">5242273759</strong></p>
                <p><span className="text-gray-500 font-medium">IFSC Code:</span> <strong className="font-mono text-gray-900 font-bold">CBIN0280274</strong></p>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-[#0369a1] hover:bg-[#0284c7] text-white font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
