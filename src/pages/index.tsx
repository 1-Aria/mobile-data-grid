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
                reportDate: data.reportDate || data['Ngày Báo Cáo'] || new Date().toISOString(),
                closePending: data.closePending || data['Chờ Đóng'] || 'N/A',
                machineId: data.machineId || data['ID Máy'] || 'N/A',
                handler: data.handler || data['Người Xác Nhận'] || 'Chưa xác nhận',
                acceptPending: data.acceptPending || data['Chờ Xác Nhận'] || 'N/A',
                acceptDate: data.acceptDate || data['Ngày Xác Nhận'] || 'N/A',
                closeDate: data.closeDate || data['Ngày Đóng'] || 'N/A',
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