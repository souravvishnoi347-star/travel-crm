"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Loader2, 
  MessageCircle, 
  Building2, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_HOTEL_DATA = {
  date: "17 May'2026",
  exoNo: "YT: YATRA 2026",
  fileNo: "02",
  hotelName: "Sarovar Portico",
  hotelAddress: "Katra , Adjoining Shrine Board Office, Jammu Road, Katra, Jammu & Kashmir- 182301",
  contactNo: "+91 7889941026",
  guestName: "MR. ALLADI BALRAJ X 02 PAX",
  roomType: "01. TRIPLE BED ROOM",
  noOfAdults: "03 Adults",
  noOfRooms: "01 Triple Rooms",
  checkIn: "17 May 2026 {13:00 Hrs}",
  checkOut: "19 May 2026 {11:00 Hrs}",
  noOfNights: "02",
  inclusions: "02 Night accommodation on twin & triple sharing basis.\nBreakfast, Lunch & Dinner at hotel {Veg. Food}.\nInclusive of all currently applicable taxes.",
  confirmationNo: "38106",
  specialRequest: "Please provide Two Triple bed Room on triple sharing basis for (Two Night)"
};

export default function HotelVouchers() {
  const [data, setData] = useState(DEFAULT_HOTEL_DATA);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [autoScale, setAutoScale] = useState<number>(0.55);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [fitMode, setFitMode] = useState<"screen" | "width">("screen");
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

  // High-Resolution PDF Download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("print-hotel-voucher");
      if (!element) {
        alert("Could not find the print container.");
        setIsDownloading(false);
        return;
      }

      // Save to Supabase Cloud
      try {
        if (data.guestName) {
          await supabase.from("vouchers").insert({
            voucher_type: "hotel",
            guest_name: data.guestName,
            document_data: data
          });
        }
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
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
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);

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

      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`Hotel_Voucher_${data.hotelName.replace(/\s+/g, "_")}.pdf`);
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `*HOTEL SERVICE VOUCHER - TRAVEL TO UTTARAKHAND*\n\nDear ${data.guestName.split('X')[0].trim()},\n\nPlease find your hotel voucher for *${data.hotelName}*.\n• Check In: ${data.checkIn}\n• Check Out: ${data.checkOut}\n• Room: ${data.roomType} (${data.noOfRooms})\n• Hotel Tel: ${data.contactNo}\n• Confirmation No: ${data.confirmationNo}\n\nThank you for choosing Travel to Uttarakhand!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  // Modular Page Renderer - Perfectly balanced for 1122px height with zero cutoff
  const renderVoucherContent = (prefix: string) => (
    <div 
      id={`${prefix}-hotel-voucher`} 
      className="w-[794px] h-[1122px] min-h-[1122px] bg-[#ffffff] shadow-2xl shrink-0 px-8 py-6 flex flex-col justify-between relative overflow-hidden text-gray-900 border-[10px] border-double border-[#0369a1]"
      style={{ boxSizing: "border-box" }}
    >
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo.png" alt="watermark" className="w-[500px] h-[500px] object-contain" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        
        {/* TOP CONTENT SECTION */}
        <div className="space-y-3">
          
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center pb-1.5 border-b border-gray-200">
            <img src="/logo.png" alt="Travel to Uttarakhand" className="h-14 w-auto object-contain mb-1" />
            <p className="text-[11px] uppercase tracking-widest text-[#0369a1] font-bold">Travel to Uttarakhand</p>
            <h1 className="text-3xl font-serif font-black text-[#0369a1] tracking-tight mt-0.5 uppercase">
              HOTEL SERVICE VOUCHER
            </h1>
            <p className="text-xs font-bold tracking-widest text-[#dc2626] uppercase mt-0.5">
              ACCOMMODATION CONFIRMATION
            </p>
            <p className="text-[10.5px] text-gray-500 italic mt-0.5">
              Devbhoomi Luxury Hospitality · Travel to Uttarakhand
            </p>
          </div>

          {/* Metadata Line */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-lg py-1 px-3.5 text-center text-[11px] font-semibold text-gray-800 flex justify-between items-center">
            <span>Date: <strong className="text-[#0369a1]">{data.date}</strong></span>
            <span>E.X.O. No: <strong className="text-gray-900">{data.exoNo}</strong></span>
            <span>File No: <strong className="text-gray-900">{data.fileNo}</strong></span>
          </div>

          {/* Hotel & Front Office To Box */}
          <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/60 flex justify-between items-start text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Addressed To</span>
              <p className="text-[11px] font-semibold text-gray-600">The Front Office / Reservations Manager</p>
              <h3 className="text-sm font-serif font-bold text-[#0369a1] mt-0.5">{data.hotelName}</h3>
              <p className="text-gray-600 max-w-md text-[10.5px] leading-snug mt-0.5">{data.hotelAddress}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Hotel Helpline</span>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{data.contactNo}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9.5px] font-semibold mt-1">Confirmed Booking</span>
            </div>
          </div>

          {/* Booking Details Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200 text-xs">
            <div className="bg-[#0369a1] text-white px-3 py-1.5 font-bold uppercase tracking-wider text-[11px] flex justify-between items-center">
              <span>Booking Particulars</span>
              <span className="text-[10px] font-normal opacity-90">Confirmation #{data.confirmationNo}</span>
            </div>
            <table className="w-full text-left text-[11px]">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-white">
                  <td className="px-3 py-1.5 font-bold text-gray-700 w-1/3 border-r border-gray-200">Guest / Group Name:</td>
                  <td className="px-3 py-1.5 font-bold text-[#0369a1]">{data.guestName}</td>
                </tr>
                <tr className="bg-gray-50/60">
                  <td className="px-3 py-1.5 font-bold text-gray-700 border-r border-gray-200">Room Category:</td>
                  <td className="px-3 py-1.5 font-semibold text-gray-900">{data.roomType}</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-1.5 font-bold text-gray-700 border-r border-gray-200">Adults & Rooms:</td>
                  <td className="px-3 py-1.5 text-gray-800">{data.noOfAdults} · {data.noOfRooms}</td>
                </tr>
                <tr className="bg-gray-50/60">
                  <td className="px-3 py-1.5 font-bold text-gray-700 border-r border-gray-200">Check-In / Out:</td>
                  <td className="px-3 py-1.5 font-semibold text-gray-900">{data.checkIn} to {data.checkOut} ({data.noOfNights} Nights)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Favouring & Special Requests Banner */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-2 text-xs space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0369a1] uppercase tracking-wider text-[10px]">FAVOURING:</span>
              <span className="font-bold text-gray-900 text-[11px]">{data.guestName}</span>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-sky-900 text-[11px]">{data.roomType}</span>
            </div>
            {data.specialRequest && (
              <p className="text-gray-700 text-[10.5px] italic pt-0.5 border-t border-sky-200/60">
                <strong className="text-gray-900 not-italic">Special Request:</strong> {data.specialRequest}
              </p>
            )}
          </div>

          {/* Package Cost Inclusions */}
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-[#0369a1] text-xs uppercase tracking-wider">
              Package Cost Includes:
            </h4>
            <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5 text-xs space-y-1">
              {data.inclusions.split('\n').filter(Boolean).map((inc, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10.5px] text-gray-800 leading-tight">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies Table */}
          <table className="w-full text-left text-[10.5px] border border-gray-200 rounded-lg overflow-hidden">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2.5 py-1 font-bold text-gray-700 w-1/4 bg-gray-50">Confirmation No.</td>
                <td className="px-2.5 py-1 font-bold text-[#0369a1] w-1/4">{data.confirmationNo}</td>
                <td className="px-2.5 py-1 font-bold text-gray-700 w-1/4 bg-gray-50">Meal Plan</td>
                <td className="px-2.5 py-1 text-gray-800 w-1/4 font-semibold">As Specified Above</td>
              </tr>
              <tr>
                <td className="px-2.5 py-1 font-bold text-gray-700 bg-gray-50">Voucher Notice</td>
                <td colSpan={3} className="px-2.5 py-1 text-gray-600 text-[9.5px] leading-tight">
                  Guest must present this original voucher along with valid government photo ID upon arrival at the hotel front desk.
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* BOTTOM SECTION: Signatory & Page Footer */}
        <div className="space-y-2 pt-1 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="logo" className="h-8 w-auto object-contain" />
              <div>
                <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Issued By</p>
                <h4 className="text-xs font-serif font-bold text-[#0369a1]">Travel to Uttarakhand</h4>
                <p className="text-[9.5px] text-gray-600 font-medium">
                  Mr. Amit kumar · +91 9719038278 · 
                  <a 
                    href="https://traveltouttarakhand.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    data-pdf-link="https://traveltouttarakhand.com" 
                    className="text-[#0369a1] font-bold hover:underline ml-1"
                  >
                    traveltouttarakhand.com
                  </a>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#0369a1] font-serif font-bold tracking-widest">ॐ नमः शिवाय</p>
              <p className="text-[8.5px] uppercase tracking-wider text-gray-400 mt-0.5">Authorized Hospitality Voucher</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-1 flex justify-between items-center text-[9.5px] text-gray-500">
            <span>Travel to Uttarakhand · +91 9719038278</span>
            <a 
              href="https://traveltouttarakhand.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              data-pdf-link="https://traveltouttarakhand.com" 
              className="font-bold text-[#0369a1] hover:underline"
            >
              🌐 www.traveltouttarakhand.com
            </a>
            <span>Hotel Service Voucher · Page 1 of 1</span>
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
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Hotel Voucher Studio</h1>
                <p className="text-xs text-gray-500">Devbhoomi Edition • 100% Editable</p>
              </div>
            </div>
            <button
              onClick={() => setData(DEFAULT_HOTEL_DATA)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-sky-600 bg-gray-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition cursor-pointer border border-gray-200"
              title="Reset to default voucher data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Header Info */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Voucher Reference</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Date</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">E.X.O. No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.exoNo} onChange={e => setData({ ...data, exoNo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">File No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.fileNo} onChange={e => setData({ ...data, fileNo: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 2. Hotel Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Hotel Details</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Name</label>
                <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.hotelName} onChange={e => setData({ ...data, hotelName: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Address</label>
                <textarea rows={2} className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.hotelAddress} onChange={e => setData({ ...data, hotelAddress: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Hotel Phone</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.contactNo} onChange={e => setData({ ...data, contactNo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Confirmation No.</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.confirmationNo} onChange={e => setData({ ...data, confirmationNo: e.target.value })} />
                </div>
              </div>
            </div>

            {/* 3. Guest & Stay Details */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Guest & Stay Particulars</span>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Guest Name & Pax</label>
                <input type="text" className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-900" value={data.guestName} onChange={e => setData({ ...data, guestName: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Room Type</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.roomType} onChange={e => setData({ ...data, roomType: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Adults</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.noOfAdults} onChange={e => setData({ ...data, noOfAdults: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Rooms Count</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.noOfRooms} onChange={e => setData({ ...data, noOfRooms: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Check In</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.checkIn} onChange={e => setData({ ...data, checkIn: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">Check Out</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold" value={data.checkOut} onChange={e => setData({ ...data, checkOut: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-0.5">No. of Nights</label>
                  <input type="text" className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-[#0369a1]" value={data.noOfNights} onChange={e => setData({ ...data, noOfNights: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Special Requests</label>
                <textarea rows={2} className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs" value={data.specialRequest} onChange={e => setData({ ...data, specialRequest: e.target.value })} />
              </div>
            </div>

            {/* 4. Inclusions */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Package Inclusions (One per line)</span>
              <textarea rows={3} className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs leading-relaxed" value={data.inclusions} onChange={e => setData({ ...data, inclusions: e.target.value })} />
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
              {renderVoucherContent("view")}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Print Container for High-Res PDF Export */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none opacity-100 z-[-100]">
        {renderVoucherContent("print")}
      </div>

    </div>
  );
}
