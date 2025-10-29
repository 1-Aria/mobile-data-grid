import { useEffect, useState, useMemo } from 'react';

// --- TYPE DEFINITION ---
// Define the expected structure of a single incident item
interface Incident {
  id: string;
  status: string;
  priority: string;
  summary: string;
  submitter: string;
  timestamp: string;
  // Include other potential fields here
}

// --- CORE COMPONENTS ---

/**
 * Renders the status pill based on the status string.
 */
const StatusPill = ({ status }: { status: string }) => {
  const lowerStatus = status ? String(status).toLowerCase() : 'default';
  let color = 'bg-gray-200 text-gray-800'; // Default
  
  if (lowerStatus === 'new' || lowerStatus === 'critical') {
    color = 'bg-red-500 text-white font-semibold';
  } else if (lowerStatus === 'pending' || lowerStatus === 'high') {
    color = 'bg-yellow-400 text-gray-900 font-semibold';
  } else if (lowerStatus === 'closed' || lowerStatus === 'low') {
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
const IncidentRow = ({ item }: { item: Incident }) => {
  // Simple copy to clipboard functionality (no need for complex useCallback here)
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      console.error("Clipboard API not available.");
    }
  };

  return (
    // Responsive grid layout: 2 columns on mobile, 5 on medium/desktop
    <div className="
      grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2
      bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-150
      border-l-4 border-indigo-500/80
    ">
      
      {/* 1. ID (Primary Field) */}
      <div className="flex flex-col md:col-span-1">
        <span className="text-xs font-medium text-gray-500 hidden md:block">ID</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-indigo-700">{item.id}</span>
          <button 
            onClick={() => copyToClipboard(item.id)}
            className="text-gray-400 hover:text-indigo-500 transition-colors"
            title="Copy ID"
          >
            {/* Lucide Copy Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>

      {/* 2. Status & Priority (Badges) */}
      <div className="flex flex-col justify-center md:col-span-1">
        <span className="text-xs font-medium text-gray-500 hidden md:block">Status / Priority</span>
        <div className='flex gap-2 flex-wrap'>
            <StatusPill status={item.status || 'N/A'} />
            <StatusPill status={item.priority || 'N/A'} />
        </div>
      </div>

      {/* 3. Summary (The Main Content) */}
      <div className="col-span-2 md:col-span-2 flex flex-col order-first md:order-none">
        <span className="text-xs font-medium text-gray-500 hidden md:block">Summary</span>
        <span className="text-sm font-medium text-gray-800 line-clamp-2 md:line-clamp-none">
            {item.summary || 'No summary provided.'}
        </span>
      </div>
      
      {/* 4. Submitter */}
      <div className="flex flex-col md:col-span-1">
        <span className="text-xs font-medium text-gray-500 hidden md:block">Submitter</span>
        <span className="text-sm text-gray-600">{item.submitter || 'Unknown'}</span>
      </div>
      
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // Data and UI States
  // Initialize with an empty array to force loading state until data is fetched
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

// --- DATA FETCHING (FROM GOOGLE APPS SCRIPT) ---
  useEffect(() => {
    // The Apps Script endpoint you provided (THIS WAS MISSING)
    const endpoint = 'https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec';

    const fetchData = async () => {
      // DEBUG: We added this line to confirm the function starts
      console.log("ATTEMPTING FETCH from Apps Script URL:", endpoint); 
      
      setLoading(true);
      setFetchError(null); 
      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && Array.isArray(result.data)) {
          // Process and normalize the data structure
          const processedData: Incident[] = result.data.map((item: any, index: number) => ({
            id: item.id || `INC-API-${index}`, 
            status: item.Status || item.status || 'N/A', 
            priority: item.Priority || item.priority || 'N/A',
            summary: item.Summary || item.summary || 'No summary',
            submitter: item.Submitter || item.submitter || 'Unknown',
            timestamp: item.Timestamp || item.timestamp || new Date().toISOString(),
          }));
          
          setAllIncidents(processedData);
        } else {
          setFetchError("Fetched data structure is unexpected. Data might be missing the 'data' array.");
        }
      } catch (error) {
        console.error("Data fetching failed:", error);
        
        let errorMessage = "Data fetching failed. Check Google Apps Script for cold start delay or network issues.";
        
        if (error instanceof Error) {
            errorMessage = `Data fetching failed. Check Google Apps Script for cold start delay or errors. (${error.message})`;
        }

        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 
// Empty dependency array


  // --- CLIENT-SIDE FILTERING LOGIC ---
  const filteredIncidents = useMemo(() => {
    let list = allIncidents;

    // 1. Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(item => 
        String(item.status).toLowerCase() === statusFilter
      );
    }

    // 2. Search Term Filter (case-insensitive)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        String(item.id).toLowerCase().includes(term) ||
        String(item.summary).toLowerCase().includes(term) ||
        String(item.submitter).toLowerCase().includes(term)
      );
    }
    
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
          Live Incident Tracker 📊
        </h1>

        {/* --- ERROR AND LOADING STATES --- */}
        {loading && (
             <div className="text-center p-8 bg-white rounded-lg shadow-md mb-6">
                <p className="text-lg font-medium text-indigo-700">
                    Fetching live data from Google Apps Script... This may take a moment due to cold start.
                </p>
            </div>
        )}

        {fetchError && !loading && (
             <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
                <p className="font-bold">Data Fetching Error:</p>
                <p className="text-sm">{fetchError}</p>
            </div>
        )}

        {/* --- FILTER BAR --- */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 bg-white p-4 rounded-lg shadow-md border border-gray-100">
          
          {/* Status Counts */}
          <div className="flex space-x-4 text-sm font-medium text-gray-700">
            <span className="text-indigo-600 font-semibold">Total: {totalCount}</span>
            <span className="text-red-600">New: {newCount}</span>
            <span className="text-yellow-600">Pending: {pendingCount}</span>
          </div>

          {/* Controls */}
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search ID, Summary, or Submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 flex-grow"
              disabled={loading} // Disable search while loading
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white"
              disabled={loading} // Disable filter while loading
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* --- TABLE HEADER (Visible on Medium screens and up) --- */}
        <div className="
          hidden md:grid md:grid-cols-5 gap-4 
          font-bold text-xs uppercase text-gray-500 
          mb-2 px-4 py-2 border-b-2 border-gray-200
        ">
          <div className="md:col-span-1">ID</div>
          <div className="md:col-span-1">Status / Priority</div>
          <div className="md:col-span-2">Summary</div>
          <div className="md:col-span-1">Submitter</div>
        </div>

        {/* --- INCIDENT LIST (The main rendering block) --- */}
        <div className="incident-list overflow-y-auto">
          
          {!loading && filteredIncidents.length === 0 && !fetchError && (
            <div className="text-center p-8 text-gray-500">
              No incidents match your current filters, or the dataset is empty.
            </div>
          )}

          {/* Renders the live data using the responsive grid component */}
          {!loading && filteredIncidents.map((incident) => (
            <IncidentRow key={incident.id} item={incident} />
          ))}
        </div>
      </div>
    </div>
  );
}