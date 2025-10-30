import React, { useEffect, useState, useMemo } from 'react';

// --- TYPE DEFINITION: Uses readable English properties mapped from Vietnamese keys ---
interface Incident {
  id: string; // "ID Sự Cố"
  status: string; // "Status"
  summary: string; // "Mô Tả Sự Cố"
  reporter: string; // "Người Báo"
  machineType: string; // "Loại Máy"
  reportDate: string; // "Ngày Báo Cáo"
  closeDuration: string; // "Chờ Đóng"
  
  // NEW FIELDS
  machineId: string; // "ID Máy"
  approver: string; // "Người Xác Nhận"
  pendingApproval: string; // "Chờ Xác Nhận"
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
 * Now includes toggle functionality, compaction, and color coding.
 */
const IncidentRow = ({ item, isExpanded, onToggle }: { item: Incident, isExpanded: boolean, onToggle: (id: string) => void }) => {
  
  const copyToClipboard = (text: string) => {
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

  // The type definition below requires `import React`
  // Replacing JSX.Element with React.ReactNode for broader compatibility and to resolve the namespace error.
  const DetailField = ({ label, value, colorClass = 'text-gray-700' }: { label: string, value: string | React.ReactNode, colorClass?: string }) => (
      // Adjusted mb for better compaction in expanded view
      <div className="flex flex-col mb-3"> 
          <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
          {/* Ensure value is displayed correctly, supporting both string and JSX */}
          <span className={`text-sm font-semibold mt-0.5 ${colorClass}`}>
            {value}
          </span>
      </div>
  );

  return (
    // Main container removed the border-l-4 for a cleaner card look
    <div 
        onClick={() => onToggle(item.id)}
        className={`
            bg-white p-3 mb-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-150
            cursor-pointer
        `}
    >
      
      {/* 🛑 CONDENSED VIEW (New 4-Column Grid Layout for Mobile) 🛑 */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-x-2 gap-y-2 items-start">
        
        {/* 1. Status (Mobile Col-span 1, Desktop Col-span 1) */}
        <div className="flex flex-col col-span-1 md:col-span-1 self-center">
            <span className="text-xs font-medium text-gray-500 hidden md:block">Status</span>
            <StatusPill status={item.status || 'N/A'} />
        </div>

        {/* 2. ID Sự Cố & Người Báo (Mobile Col-span 1, Desktop Col-span 2) - INDIGO Group */}
        <div className="flex flex-col col-span-1 md:col-span-2">
            <span className="text-xs font-medium text-gray-500 hidden md:block">ID / Người Báo</span>
            <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-sm font-bold text-indigo-700">{item.id}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(item.id); }}
                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                    title="Copy ID"
                >
                    {/* Copy Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
            </div>
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis block">{item.reporter || 'Ẩn danh'}</span>
        </div>

        {/* 3. Ngày Báo Cáo & Chờ Đóng (Mobile Col-span 1, Desktop Col-span 1) - CYAN Group */}
        <div className="flex flex-col col-span-1 md:col-span-1">
            <span className="text-xs font-medium text-gray-500 hidden md:block">Time/Duration</span>
            {/* Ngày Báo Cáo - Cyan */}
            <span className="text-sm font-semibold text-cyan-700 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis block">{item.reportDate}</span>
            {/* Chờ Đóng - Cyan */}
            <span className="text-xs text-cyan-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis block">{item.closeDuration || 'N/A'}</span>
        </div>

        {/* 4. Chờ Xác Nhận & Expansion Arrow (Mobile Col-span 1, Desktop Col-span 1) - YELLOW Group */}
        <div className="flex flex-col col-span-1 md:col-span-1 items-end">
            <span className="text-xs font-medium text-gray-500 hidden md:block">Pending Action</span>
            {/* Chờ Xác Nhận - Yellow */}
            <span className="text-sm font-semibold text-yellow-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis block">{item.pendingApproval || 'N/A'}</span>
            {/* Expansion Arrow */}
            <svg 
                xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className={`lucide lucide-chevron-down text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            >
                <path d="m6 9 6 6 6-6"/>
            </svg>
        </div>
        
      </div>

      {/* 🛑 EXPANDED VIEW (Full Details) 🛑 */}
      {isExpanded && (
        <div className="col-span-full pt-4 mt-2 border-t border-gray-100/80">
            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-1">Chi Tiết Sự Cố</h3>

            {/* Grid for Detailed Info (3 columns on desktop, 2 on mobile) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* 1. Technical Info (Orange Group) */}
                <div>
                    <DetailField label="ID Máy" value={item.machineId} colorClass="text-orange-600" />
                    <DetailField label="Loại Máy" value={item.machineType} colorClass="text-orange-600" />
                    <DetailField label="Người Xác Nhận" value={item.approver} colorClass="text-gray-700" />
                </div>
                
                {/* 2. Duration/Date Info */}
                <div>
                    <DetailField label="Ngày Báo Cáo" value={item.reportDate} colorClass="text-cyan-700" />
                    <DetailField label="Chờ Xác Nhận" value={item.pendingApproval} colorClass="text-yellow-600" />
                    <DetailField label="Chờ Đóng (Duration)" value={item.closeDuration} colorClass="text-cyan-700" />
                </div>

                {/* 3. Summary (Takes full column on Mobile, 1/3 on Desktop) */}
                <div className="col-span-full md:col-span-1">
                    {/* Summary uses default color for max readability */}
                    <DetailField label="Mô Tả Sự Cố (Summary)" value={item.summary} /> 
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

        // 2. NORMALIZE: Map Vietnamese keys to internal English properties, INCLUDING NEW FIELDS
        const processedData: Incident[] = validData.map((item: any, index: number) => ({
            id: item["ID Sự Cố"] || `INC-API-${index}`, 
            status: item.Status || 'N/A', 
            summary: item["Mô Tả Sự Cố"] || 'No description',
            reporter: item["Người Báo"] || 'Unknown',
            machineType: item["Loại Máy"] || 'Unknown Type',
            reportDate: item["Ngày Báo Cáo"] || new Date().toISOString(),
            closeDuration: item["Chờ Đóng"] || 'N/A',
            // Mapped new fields
            machineId: item["ID Máy"] || 'N/A', 
            approver: item["Người Xác Nhận"] || 'Chưa xác nhận', 
            pendingApproval: item["Chờ Xác Nhận"] || 'N/A', 
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
    
    // 🛑 CLIENT-SIDE SORTING REMOVED: Data displays in the order received from the source.
    
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
                        className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 flex-grow min-w-[200px]"
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

        {/* --- TABLE HEADER (Visible on Medium screens and up, aligned to new columns) --- */}
        {!loading && !fetchError && (
            <div className="
                hidden md:grid md:grid-cols-5 gap-x-2 
                font-bold text-xs uppercase text-gray-500 
                mb-2 px-3 py-2 border-b-2 border-gray-200
            ">
                <div className="md:col-span-1">Status</div>
                <div className="md:col-span-2">ID / Người Báo</div>
                <div className="md:col-span-1">Time/Duration</div>
                <div className="md:col-span-1 text-right">Pending Action</div>
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
