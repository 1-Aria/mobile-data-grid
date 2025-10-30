import React, { useEffect, useState, useMemo } from 'react';

// --- TYPE DEFINITION: Uses readable English properties mapped from Vietnamese keys ---
interface Incident {
  id: string; // "ID Sự Cố"
  status: string; // "Status"
  summary: string; // "Mô Tả Sự Cố"
  reporter: string; // "Người Báo"
  machineType: string; // "Loại Máy"
  reportDate: string; // "Ngày Báo Cáo"
  closePending: string; // "Chờ Đóng" (Kept for expanded view)
  
  // Existing mapped fields (using user's new names)
  machineId: string; // "ID Máy"
  handler: string; // "Người Xác Nhận"
  acceptPending: string; // "Chờ Xác Nhận"

  // 🛑 ALL FIELDS FROM YOUR DATA SOURCE ARE NOW INCLUDED 🛑
  acceptDate: string; // "Ngày Xác Nhận"
  closeDate: string; // "Ngày Đóng"
  closer: string; // "Người Đóng"
  processingStep: string; // "Bước Xử Lý"
  preventionMethod: string; // "Cách Ngăn Ngừa"
}

// --- CORE COMPONENTS ---

/**
 * Renders the status pill based on the status string.
 */
const StatusPill = ({ status }: { status: string }) => {
  const lowerStatus = status ? String(status).toLowerCase() : 'default';
  let color = 'bg-gray-200 text-gray-800'; // Default: N/A

  // Status mapping based on common incident states
  if (lowerStatus === 'new') {
    color = 'bg-red-500 text-white font-semibold';
  } else if (lowerStatus === 'pending') {
    color = 'bg-yellow-400 text-gray-900 font-semibold';
  } else if (lowerStatus === 'closed') {
    color = 'bg-green-500 text-white';
  }

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${color} transition duration-150 ease-in-out whitespace-nowrap`}>
      {status}
    </span>
  );
};

/**
 * Renders a single incident row using a responsive grid layout.
 */
const IncidentRow = ({ item, isExpanded, onToggle }: { item: Incident, isExpanded: boolean, onToggle: (id: string) => void }) => {
  
  const copyToClipboard = (text: string) => {
    // Standard clipboard implementation
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  // DetailField component
  const DetailField = ({ label, value, colorClass = 'text-gray-700' }: { label: string, value: string | React.ReactNode, colorClass?: string }) => (
      <div className="flex flex-col mb-3"> 
          {/* Updated: Bigger (text-base), Bold (font-bold), Blue theme (text-indigo-700) */}
          <span className="text-base font-bold text-indigo-700">{label}</span>
          
          {/* Value remains text-sm, making the label visually larger */}
          <span className={`text-sm font-semibold mt-0.5 ${colorClass}`}>
            {value}
          </span>
      </div>
  );

  return (
    <div 
        onClick={() => onToggle(item.id)}
        className={`
            bg-white p-3 mb-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-150
            cursor-pointer
        `}
    >
      
      {/* 🛑 CONDENSED VIEW (Optimized 4-Column Layout for all devices - NEW FIELD STRUCTURE) 🛑 */}
      {/* Removed md:grid-cols-[...] for strict 4-column layout on all screens */}
      <div className="grid grid-cols-4 gap-x-3 items-start md:items-center">
        
        {/* 1. ID Sự Cố (Col 1) - Primary ID */}
        <div className="flex flex-col col-span-1">
            {/* Label kept for ID Sự Cố on mobile for clarity */}
            <span className="text-xs font-medium text-gray-500 md:hidden block">ID Sự Cố</span> 
            <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-sm font-bold text-gray-900">{item.id}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(item.id); }}
                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                    title="Copy ID"
                >
                    {/* Copy Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
            </div>
        </div>
        
        {/* 2. Status & Ngày Báo Cáo (Col 2) */}
        <div className="flex flex-col col-span-1">
            <span className="text-xs font-medium text-gray-500 md:hidden">Status / Ngày Báo Cáo</span>
            <StatusPill status={item.status || 'N/A'} />
            <span className="text-xs text-gray-700 font-medium mt-1 block">{item.reportDate}</span>
        </div>

        {/* 3. Chờ Xác Nhận & Chờ Đóng (Col 3) */}
        <div className="flex flex-col col-span-1">
            <span className="text-xs font-medium text-gray-500 md:hidden block">Chờ XN/Đóng</span>
            {/* Chờ Xác Nhận */}
            <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis block">
                {item.acceptPending || 'N/A'}
            </span>
            {/* Chờ Đóng */}
            <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis block">
                {item.closePending || 'N/A'}
            </span>
        </div>

        {/* 4. Người Báo & Chevron (Col 4) */}
        <div className="flex flex-col col-span-1 items-start md:items-end justify-between"> 
            {/* Label for mobile */}
            <span className="text-xs font-medium text-gray-500 block md:hidden">Người Báo</span> 
            
            {/* Reporter Name */}
            <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis block md:text-right">{item.reporter || 'Ẩn danh'}</span>
            
            {/* Arrow - Always visible in the last column, aligned right on desktop */}
            <div className='mt-1 md:mt-0 md:pr-4'>
                 <svg 
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className={`lucide lucide-chevron-down text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                >
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </div>
        </div>
        
      </div>

      {/* 🛑 EXPANDED VIEW (Full Details) - Updated with new properties 🛑 */}
      {isExpanded && (
        <div className="col-span-full pt-4 mt-2 border-t border-gray-100/80">
            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-1">Chi Tiết Sự Cố</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Group 1: Technical / Machine Details */}
                <div>
                    <DetailField label="Ngày Báo Cáo" value={item.reportDate} labelColor="text-red-500"/>
                    <DetailField label="ID Máy" value={item.machineId} />
                    <DetailField label="Loại Máy" value={item.machineType} />
                    <DetailField label="Mô Tả Sự Cố " value={item.summary} />
                </div>
                
                {/* Group 2: Date / Duration / Status Details */}
                <div>
                    <DetailField label="Ngày Xác Nhận" value={item.acceptDate} />
                    <DetailField label="Người Xác Nhận" value={item.handler} />
                    <DetailField label="Ngày Đóng" value={item.closeDate} />
                    <DetailField label="Người Đóng" value={item.closer} />
                </div>

                {/* Group 3: Summary / Steps / Prevention */}
                <div className="col-span-full md:col-span-1">
                    <DetailField label="Bước Xử Lý" value={item.processingStep} />
                    <DetailField label="Cách Ngăn Ngừa" value={item.preventionMethod} />
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // Data and UI States
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const statusOptions = ['all', 'new', 'pending', 'closed']; 
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for expansion
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Toggle function passed down to children
  const handleToggle = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };


  // --- DATA FETCHING (FROM GOOGLE APPS SCRIPT) ---
  useEffect(() => {
    // The Apps Script endpoint is intentionally kept here as a URL, 
    // as it is the defined method for fetching data in this application structure.
    const endpoint = 'https://script.google.com/macros/s/AKfycbx5eUTlDBXu95ZE9pYqo4rOlYNXRBbOifJM819CXGvUmhgS4GgvpwCqvVMa1LeEdAoGYQ/exec';

    const fetchData = async () => {
      console.log("ATTEMPTING FETCH from Apps Script URL:", endpoint); 
      
      setLoading(true);
      setFetchError(null); 
      try {
        // Simple fetch attempt with no explicit backoff, relying on network stability for this pattern
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        let rawDataArray: any[] = [];
        
        if (Array.isArray(result)) {
            rawDataArray = result; 
        } else if (result && Array.isArray(result.data)) {
            rawDataArray = result.data;
        } 
        
        if (!Array.isArray(rawDataArray)) {
             throw new Error("API response does not contain a valid array of incident data. Please check the endpoint.");
        }
        
        // 1. FILTER: Remove empty entries based on the Incident ID
        const validData = rawDataArray.filter(item => {
            return item["ID Sự Cố"] && String(item["ID Sự Cố"]).trim() !== '';
        });

        // 2. NORMALIZE: Map Vietnamese keys to internal English properties, INCLUDING ALL FIELDS
        const processedData: Incident[] = validData.map((item: any, index: number) => ({
            id: item["ID Sự Cố"] || `INC-API-${index}`, 
            status: item.Status || 'N/A', 
            summary: item["Mô Tả Sự Cố"] || 'No description',
            reporter: item["Người Báo"] || 'Unknown',
            machineType: item["Loại Máy"] || 'Unknown Type',
            reportDate: item["Ngày Báo Cáo"] || new Date().toISOString(),
            closePending: item["Chờ Đóng"] || 'N/A',
            
            // Existing mapped fields (using user's new properties)
            machineId: item["ID Máy"] || 'N/A', 
            handler: item["Người Xác Nhận"] || 'Chưa xác nhận', // Updated from approver
            acceptPending: item["Chờ Xác Nhận"] || 'N/A', // Updated from pendingApproval

            // 🛑 MAPPED REVISED FIELDS 🛑
            acceptDate: item["Ngày Xác Nhận"] || 'N/A', // Updated from confirmationDate
            closeDate: item["Ngày Đóng"] || 'N/A',
            closer: item["Người Đóng"] || 'N/A',
            processingStep: item["Bước Xử Lý"] || 'N/A',
            preventionMethod: item["Cách Ngăn Ngừa"] || 'N/A',
        }));
        
        setAllIncidents(processedData); 

      } catch (error) {
        console.error("Data fetching failed:", error);
        
        let errorMessage = "Data fetching failed. Check Google Apps Script for cold start delay or network issues.";
        
        if (error instanceof Error) {
            errorMessage = `${error.message}`;
        }

        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  // --- CLIENT-SIDE FILTERING LOGIC (Optimized with useMemo) ---
  const filteredIncidents = useMemo(() => {
    let list = allIncidents;

    // 1. Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(item => 
        String(item.status).toLowerCase() === statusFilter
      );
    }

    // 2. Search Term Filter (case-insensitive across relevant fields)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        String(item.id).toLowerCase().includes(term) ||
        String(item.summary).toLowerCase().includes(term) ||
        String(item.reporter).toLowerCase().includes(term) ||
        String(item.machineType).toLowerCase().includes(term) ||
        String(item.machineId).toLowerCase().includes(term)
      );
    }
    
    // 🛑 CLIENT-SIDE SORTING REMAINS REMOVED
    
    return list;
  }, [allIncidents, statusFilter, searchTerm]);
  
  // Counts for the filter bar
  const totalCount = allIncidents.length;
  const newCount = allIncidents.filter(i => String(i.status).toLowerCase() === 'new').length;
  const pendingCount = allIncidents.filter(i => String(i.status).toLowerCase() === 'pending').length;

  // --- UI RENDER ---
  
  return (
    <div className="dashboard-container min-h-screen bg-gray-50 p-4 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
          Hệ Thống Theo Dõi Sự Cố Trực Tuyến 📊
        </h1>

        {/* --- ERROR AND LOADING STATES --- */}
        {loading && (
            <div className="text-center p-8 bg-white rounded-lg shadow-md mb-6">
                <p className="text-lg font-medium text-indigo-700">
                    Đang tải dữ liệu trực tiếp từ Google Sheets... (Có thể mất vài giây do khởi động hệ thống).
                </p>
            </div>
        )}

        {fetchError && !loading && (
            <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <p className="font-bold">Lỗi Tải Dữ Liệu:</p>
                <p className="text-sm">{fetchError}</p>
            </div>
        )}

        {/* --- FILTER BAR --- */}
        {!loading && !fetchError && (
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                
                {/* Status Counts */}
                <div className="flex space-x-4 text-sm font-medium text-gray-700">
                    <span className="text-indigo-600 font-semibold">Tổng cộng: {totalCount}</span>
                    <span className="text-red-600">Mới: {newCount}</span>
                    <span className="text-yellow-600">Đang chờ: {pendingCount}</span>
                </div>

                {/* Controls */}
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm ID, Mô tả, Người báo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 flex-grow min-w-[200px] text-gray-800 placeholder-gray-500"
                        disabled={loading}
                    />
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm bg-white"
                        disabled={loading}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {statusOptions.filter(s => s !== 'all').map(s => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        )}

        {/* --- TABLE HEADER (Visible on Medium screens and up, ALIGNED to the new 4 columns) --- */}
        {!loading && !fetchError && (
            <div className="
                hidden md:grid md:grid-cols-4 gap-x-3 
                font-bold text-xs uppercase text-gray-500 
                mb-2 px-3 py-2 border-b-2 border-gray-200
            ">
                <div className="col-span-1">ID Sự Cố</div>
                <div className="col-span-1">ID Máy / Loại Máy</div>
                <div className="col-span-1">Status / Ngày Báo Cáo</div>
                <div className="col-span-1 text-right pr-4">Người Báo</div> 
            </div>
        )}

        {/* --- INCIDENT LIST (The main rendering block) --- */}
        <div className="incident-list overflow-y-auto">
            
            {!loading && filteredIncidents.length === 0 && !fetchError && (
                <div className="text-center p-8 text-gray-500">
                    Không có sự cố nào phù hợp với bộ lọc.
                </div>
            )}

            {/* Renders the live data using the responsive grid component */}
            {!loading && filteredIncidents.map((incident) => (
                <IncidentRow 
                    key={incident.id} 
                    item={incident} 
                    isExpanded={expandedId === incident.id}
                    onToggle={handleToggle}
                />
            ))}
        </div>
      </div>
    </div>
  );
}
