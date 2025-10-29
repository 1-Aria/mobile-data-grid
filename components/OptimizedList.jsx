// components/OptimizedList.tsx

import React from 'react';
// The import must be dynamic because react-window relies on the window object 
// which is not available during Next.js server-side rendering (SSR) or SSG.
import dynamic from 'next/dynamic';
import { CollapsibleItem } from './CollapsibleItem';

// Define DataEntry type/interface here or import it
interface DataEntry { 
    // ... Define your data structure here ... 
    id: number;
    title: string;
    status: 'Active' | 'Complete' | 'Pending';
    date: string;
    details: string;
}

interface OptimizedListProps {
  entries: DataEntry[];
}

// Dynamically import FixedSizeList with SSR disabled
const FixedSizeList = dynamic(
  () => import('react-window').then(mod => mod.FixedSizeList),
  { ssr: false }
);

// This component is the actual row renderer for react-window
interface RowProps {
  index: number;
  style: React.CSSProperties; // Style object passed by FixedSizeList for positioning
  data: DataEntry[]; // The list of entries passed via itemData
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const entry = data[index];
  
  // CRITICAL: The style prop MUST be applied to the outer element 
  // for virtualization to work correctly.
  return (
    <div style={style}>
      {/* We need to pass the entry data to our collapsible component */}
      <CollapsibleItem entry={entry} />
    </div>
  );
};

// Main List Component
export const OptimizedList: React.FC<OptimizedListProps> = ({ entries }) => {
  // Determine list height dynamically or use a fixed value. 
  // Viewport height (vh) is great for mobile apps.
  const listHeight = typeof window !== 'undefined' ? window.innerHeight - 150 : 600; 

  if (!FixedSizeList) {
    return <div className="text-center p-4">Loading list...</div>;
  }

  return (
    <div className="w-full mx-auto max-w-xl">
      <FixedSizeList
        height={listHeight} // Dynamically calculated or a fixed value
        width={'100%'} // Ensure it takes full width for mobile
        itemCount={entries.length} // Total number of items
        itemSize={120} // **ESTIMATED ROW HEIGHT (in pixels).** Important! 
                      // This must be large enough to contain the collapsed item. 
                      // Adjust this based on the height of your CollapsibleItem.
        itemData={entries} // Pass the array data to the Row component
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};