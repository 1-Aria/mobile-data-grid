import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
// ADD THESE FIRESTORE IMPORTS
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Adjust path as needed

// Keep your existing Incident interface and components (StatusPill, DetailField, IncidentRow) unchanged
// ... [Your existing interface and components remain the same] ...

// --- TYPE DEFINITION: Uses readable English properties mapped from Vietnamese keys ---
interface Incident {
  id: string; // "ID Sự Cố"
  status: string; // "Status"
  summary: string; // "Mô Tả Sự Cố"
  reporter: string; // "Người Báo"
  machineType: string; // "Loại Máy"
  reportDate: string; // "Ngày Báo Cáo"
  closePending: string; // "Chờ Đóng" (Kept for expanded view)
  machineId: string; // "ID Máy"
  handler: string; // "Người Xác Nhận"
  acceptPending: string; // "Chờ Xác Nhận"
  acceptDate: string; // "Ngày Xác Nhận"
  closeDate: string; // "Ngày Đóng"
  closer: string; // "Người Đóng"
  processingStep: string; // "Bước Xử Lý"
  preventionMethod: string; // "Cách Ngăn Ngừa"
}

// Define a function to safely convert the date value to a string
const formatDate = (dateValue: any): string => {
  if (!dateValue) {
    return 'N/A'; // Return a default if the value is null/undefined
  }

  // 1. Check if it's a Firestore Timestamp object (most likely cause of React error)
  if (typeof dateValue === 'object' && dateValue.toDate) {
    return dateValue.toDate().toLocaleDateString('en-US'); // Convert object to string
  }

  // 2. Check if it's a UNIX millisecond timestamp (number)
  if (typeof dateValue === 'number') {
    return new Date(dateValue).toLocaleDateString('en-US'); // Convert number to string
  }

  // 3. If it's already a string (like the default new Date().toISOString()), return it
  return String(dateValue);
};

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
 * DetailField component (hoisted for performance)
 */
const DetailField = ({ label, value, colorClass = 'text-gray-700' }: { label: string, value: string | React.ReactNode, colorClass?: string }) => (
    <div className="flex flex-col mb-3">
        <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
        <span className={`text-sm font-semibold mt-0.5 ${colorClass}`}>
          {value}
        </span>
    </div>
);

/**
 * Renders a single incident row using a responsive grid layout.
 * OPTIMIZATION 2: Wrapped in React.memo() to prevent unnecessary re-renders.
 */
const IncidentRow = React.memo(({ item, isExpanded, onToggle }: { item: Incident, isExpanded: boolean, onToggle: (id: string) => void }) => {
  
  // OPTIMIZATION 3: Hoisted copyToClipboard function (moved outside component)
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

  return (
    <div 
        onClick={() => onToggle(item.id)}
        className={`
            bg-white p-3 mb-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-150
            cursor-pointer
        `}
    >
      
      {/* 🛑 CONDENSED VIEW (Optimized 4-Column Layout for all devices) 🛑 */}
      <div className="grid grid-cols-4 gap-x-3 items-start md:items-center">
        
        {/* 1. ID Sự Cố (Col 1) - Primary ID */}
        <div className="flex flex-col col-span-1">
            {/* Label kept for ID Sự Cố on mobile for clarity */}
            <span className="text-xs font-medium text-gray-500 md:hidden block">ID Sự Cố</span> 
            <div className="flex items-center space-x-1 mb-0.5">
                <span className="text-sm font-bold text-indigo-700">{item.id}</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(item.id); }}
                    className="p-1.5 text-2xl text-gray-400 active:text-indigo-600 transition-colors"
                    title="Copy ID"
                    >
                    {/* Copy Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
            </div>
        </div>

        {/* 2. ID Máy & Loại Máy (Col 2) */}
        <div className="flex flex-col col-span-1">
            <span className="text-xs font-medium text-gray-500 md:hidden block">ID Máy / Loại</span>
            <span className="text-sm text-gray-900 font-semibold whitespace-nowrap overflow-hidden text-ellipsis block">{item.machineId || 'N/A'}</span>
            <span className="text-xs text-gray-700 font-medium mt-1 block">{item.machineType || 'N/A'}</span>
        </div>
        
        {/* 3. Status & Ngày Báo Cáo (Col 3) */}
        <div className="flex flex-col col-span-1">
            <span className="text-xs font-medium text-gray-500 md:hidden block">Status / Ngày Báo Cáo</span>
            <StatusPill status={item.status || 'N/A'} />
            <span className="text-xs text-gray-700 font-medium mt-1 block">{item.reportDate}</span>
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

      {/* 🛑 EXPANDED VIEW (Full Details) 🛑 */}
      {isExpanded && (
        <div className="col-span-full pt-4 mt-2 border-t border-gray-100/80">
            <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-1">Chi Tiết Sự Cố</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Group 1: Technical / Machine Details */}
                <div>
                    <DetailField label="Ngày Báo Cáo" value={item.reportDate} />
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
                    <DetailField label="Chờ Xác Nhận" value={item.acceptPending} />
                    <DetailField label="Chờ Đóng (Duration)" value={item.closePending} />
                    <DetailField label="Bước Xử Lý" value={item.processingStep} />
                    <DetailField label="Cách Ngăn Ngừa" value={item.preventionMethod} />
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
}); // End of React.memo for IncidentRow

IncidentRow.displayName = 'IncidentRow'

export default function App() {
  // Keep all your existing state variables
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const statusOptions = ['all', 'new', 'pending', 'closed']; 
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  }, []);

  // REPLACE YOUR EXISTING useEffect WITH THIS FIRESTORE REAL-TIME LISTENER
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirestoreListener = async () => {
      console.log("Setting up Firestore real-time listener...");
      
      setLoading(true);
      setFetchError(null);

      try {
        // Create a query to your Firestore collection
        // Replace 'incidents' with your actual collection name
        const incidentsQuery = query(
          collection(db, 'incidents'),
          orderBy('reportDate', 'desc') // Optional: order by report date
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(
          incidentsQuery,
          (querySnapshot) => {
            console.log("Firestore data updated, processing documents...");
            
            const processedData: Incident[] = [];
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              
              // Map Firestore document data to your Incident interface
              // Adjust these field mappings based on your Firestore document structure
              const incident: Incident = {
                id: doc.id, // Use Firestore document ID
                status: data.status || data.Status || 'N/A',
                summary: data.summary || data['Mô Tả Sự Cố'] || 'No description',
                reporter: data.reporter || data['Người Báo'] || 'Unknown',
                machineType: data.machineType || data['Loại Máy'] || 'Unknown Type',
                reportDate: formatDate(data.reportDate || data['Ngày Báo Cáo'] || new Date().toISOString()),
                closePending: data.closePending || data['Chờ Đóng'] || 'N/A',
                machineId: data.machineId || data['ID Máy'] || 'N/A',
                handler: data.handler || data['Người Xác Nhận'] || 'Chưa xác nhận',
                acceptPending: data.acceptPending || data['Chờ Xác Nhận'] || 'N/A',
                acceptDate: formatDate(data.acceptDate || data['Ngày Xác Nhận'] || 'N/A'),
                closeDate: formatDate(data.closeDate || data['Ngày Đóng'] || 'N/A'),
                closer: data.closer || data['Người Đóng'] || 'N/A',
                processingStep: data.processingStep || data['Bước Xử Lý'] || 'N/A',
                preventionMethod: data.preventionMethod || data['Cách Ngăn Ngừa'] || 'N/A',
              };
              
              processedData.push(incident);
            });

            console.log(`Processed ${processedData.length} incidents from Firestore`);
            setAllIncidents(processedData);
            setLoading(false);
          },
          (error) => {
            console.error("Firestore listener error:", error);
            setFetchError(`Firestore connection failed: ${error.message}`);
            setLoading(false);
          }
        );

      } catch (error) {
        console.error("Failed to set up Firestore listener:", error);
        setFetchError(`Failed to connect to Firestore: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    setupFirestoreListener();

    // Cleanup function to unsubscribe from the listener
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up Firestore listener...");
        unsubscribe();
      }
    };
  }, []); // Empty dependency array - listener sets up once on mount

  // Keep all your existing filtering logic and other functions unchanged
  const filteredIncidents = useMemo(() => {
    let list = allIncidents;

    if (statusFilter !== 'all') {
      list = list.filter(item => 
        String(item.status).toLowerCase() === statusFilter
      );
    }

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
    
    return list;
  }, [allIncidents, statusFilter, searchTerm]);
  
  const { totalCount, newCount, pendingCount } = useMemo(() => {
    const total = allIncidents.length;
    const newC = allIncidents.filter(i => String(i.status).toLowerCase() === 'new').length;
    const pendingC = allIncidents.filter(i => String(i.status).toLowerCase() === 'pending').length;
    return { totalCount: total, newCount: newC, pendingCount: pendingC };
  }, [allIncidents]);

  // Keep all your existing JSX render logic unchanged
  return (
    <div className="dashboard-container min-h-screen bg-gray-50 p-4 font-sans antialiased">
      {/* ... rest of your existing JSX remains exactly the same ... */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
          Hệ Thống Báo Cáo Sự Cố - Real-time
        </h1>

        {loading && (
            <div className="text-center p-8 bg-white rounded-lg shadow-md mb-6">
                <p className="text-lg font-medium text-indigo-700">
                    Đang kết nối Firestore...
                </p>
            </div>
        )}

        {fetchError && !loading && (
            <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <p className="font-bold">Lỗi Kết Nối Firestore:</p>
                <p className="text-sm">{fetchError}</p>
            </div>
        )}

        {/* Keep all your existing filter bar and table rendering logic */}
        {!loading && !fetchError && (
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex space-x-4 text-sm font-medium text-gray-700">
                    <span className="text-indigo-600 font-semibold">Tổng cộng: {totalCount}</span>
                    <span className="text-red-600">Mới: {newCount}</span>
                    <span className="text-yellow-600">Đang chờ: {pendingCount}</span>
                    <span className="text-green-600 text-xs">🔥 Real-time</span>
                </div>

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
                        className="p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
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

        <div className="incident-list overflow-y-auto" style={{ height: '70vh' }}>
            {!loading && filteredIncidents.length === 0 && !fetchError && (
                <div className="text-center p-8 text-gray-500">
                    Không có sự cố nào phù hợp với bộ lọc.
                </div>
            )}

            {!loading && filteredIncidents.length > 0 && (
                <Virtuoso
                    style={{ height: '100%' }}
                    data={filteredIncidents}
                    itemContent={(index, incident) => (
                        <IncidentRow 
                            key={incident.id} 
                            item={incident} 
                            isExpanded={expandedId === incident.id}
                            onToggle={handleToggle}
                        />
                    )}
                />
            )}
        </div>
      </div>
    </div>
  );
}