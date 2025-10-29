import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CollapsibleItem } from './CollapsibleItem';

// Define DataEntry type/interface here or import it
interface DataEntry { 
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
// CRITICAL: react-window needs the 'window' object, so it must be client-side rendered (ssr: false)
const FixedSizeList = dynamic(
  () => import('react-window').then(mod => mod.FixedSizeList),
  { ssr: false }
);

// This component is the actual row renderer for react-window
interface RowProps {
  index: number;
  style: React.CSSProperties; // Style prop for positioning MUST be applied
  data: DataEntry[]; 
}

const Row: React.FC<RowProps> = ({ index, style, data }) => {
  const entry = data[index];
  
  return (
    // CRITICAL: The style prop is what makes virtualization work!
    <div style={style}>
      <CollapsibleItem entry={entry} />
    </div>
  );
};

// Main List Component
export const OptimizedList: React.FC<OptimizedListProps> = ({ entries }) => {
  const [listHeight, setListHeight] = useState(600); 

  // Use a useEffect hook to set the height once the component mounts (client-side)
  useEffect(() => {
    // Set height to viewport height minus header/padding (approx 150px)
    if (typeof window !== 'undefined') {
      setListHeight(window.innerHeight - 150); 
    }
  }, []);

  if (!FixedSizeList) {
    return <div className="text-center p-4">Initializing list...</div>;
  }
  
  // The estimated height of one COLLAPSED row (in pixels). 
  // Adjust this value if your CollapsibleItem height changes.
  const ESTIMATED_ITEM_SIZE = 60; 

  return (
    <div className="w-full mx-auto max-w-xl">
      <FixedSizeList
        height={listHeight} 
        width={'100%'} 
        itemCount={entries.length} 
        itemSize={ESTIMATED_ITEM_SIZE} 
        itemData={entries} 
      >
        {Row}
      </FixedSizeList>
    </div>
  );
};