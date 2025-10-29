import React, { useState } from 'react';

// Match this interface to the one in index.tsx
interface DataEntry { 
    id: number;
    title: string;
    status: 'Active' | 'Complete' | 'Pending';
    date: string;
    details: string;
}

interface CollapsibleItemProps {
  entry: DataEntry;
}

// Simple map for Tailwind status colors
const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Complete': 'bg-blue-100 text-blue-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
};

export const CollapsibleItem: React.FC<CollapsibleItemProps> = ({ entry }) => {
  // Local state to manage the expansion of this single item
  const [isExpanded, setIsExpanded] = useState(false);
  
  const colorClass = statusColors[entry.status] || 'bg-gray-100 text-gray-800';

  return (
    <div 
      className="mb-2 border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow"
      // CRITICAL: Ensure the item's height is fixed when collapsed for react-window
      style={{ height: '100%' }}
    >
      {/* Summary Grid (The clickable header) */}
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Key Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate text-gray-800">{entry.title}</p>
          <p className="text-xs text-gray-500">{entry.date}</p>
        </div>

        {/* Right: Status Tag and Expand Icon */}
        <div className="flex items-center space-x-3">
             <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                {entry.status}
             </span>
             <svg 
               className={`w-4 h-4 text-blue-500 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
               fill="none" stroke="currentColor" viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
             </svg>
        </div>
      </div>

      {/* Expanded Details (Toggled visibility) */}
      <div 
        // Tailwind class for smooth expansion
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 p-3 pt-0' : 'max-h-0 opacity-0'}`}
      >
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Details:</p>
          <p className="text-sm text-gray-600 mb-2">{entry.details}</p>
          {/* Add more fields here from your data if needed */}
        </div>
      </div>
    </div>
  );
};