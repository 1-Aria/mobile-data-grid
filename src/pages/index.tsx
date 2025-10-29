import { GetStaticProps, NextPage } from 'next';
import React from 'react';

// Import the components we will create in the next steps
import { OptimizedList } from '../src/components/OptimizedList'; 

// --- 1. Define the TypeScript Interface ---
// IMPORTANT: Adjust these fields and types to match the exact keys 
// returned by your Google Sheet endpoint!
interface DataEntry {
  id: number;
  title: string;
  status: 'Active' | 'Complete' | 'Pending';
  date: string; // E.g., "2025-10-29"
  details: string;
  // Add any other columns from your sheet here
}

// --- 2. Data Fetching Logic (Runs at Build Time on Vercel) ---
export const getStaticProps: GetStaticProps<{ entries: DataEntry[] }> = async () => {
  const endpoint = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

  try {
    const res = await fetch(endpoint);
    
    // NOTE: Your Google Sheet endpoint often returns an object like { data: [...] }
    // Adjust this line based on the exact structure of the JSON you receive.
    const result = await res.json(); 
    
    // Assuming the data is directly in the 'result' or inside a 'data' key
    const entries: DataEntry[] = Array.isArray(result) ? result : result.data || []; 

    return {
      props: {
        entries: entries,
      },
      // Incremental Static Regeneration (ISR): Re-generate the page every 1 hour (3600s)
      // This is crucial for performance AND data freshness.
      revalidate: 3600, 
    };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return {
      props: { entries: [] },
      revalidate: 3600, 
    };
  }
}

// --- 3. Main Page Component ---
interface Props {
  entries: DataEntry[];
}

const HomePage: NextPage<Props> = ({ entries }) => {
  return (
    // Mobile-first container with Tailwind CSS
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <header className="py-3 mb-4 border-b">
        <h1 className="text-xl font-bold text-center text-blue-700">
          Mobile Data Grid ({entries.length} Entries)
        </h1>
      </header>
      
      {entries.length > 0 ? (
        // Pass the fetched data to the optimized list component
        <OptimizedList entries={entries} />
      ) : (
        <p className="text-center text-gray-500 mt-10">
            Loading failed or no data available.
        </p>
      )}
    </div>
  );
}

export default HomePage;