// Define the shape of a single data entry
interface DataEntry {
  id: number;
  title: string;
  status: 'Active' | 'Complete' | 'Pending';
  date: string; // or Date
  details: string;
  // ... other fields from your sheet
}
// pages/index.tsx (or .jsx)

import { GetStaticProps, NextPage } from 'next';
// Import your components from step 3 & 4
import { OptimizedList } from '../components/OptimizedList'; 

interface DataEntry { /* ... Define your data structure here ... */ }

// --- 1. Data Fetching Logic ---
export const getStaticProps: GetStaticProps<{ entries: DataEntry[] }> = async () => {
  const endpoint = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

  try {
    const res = await fetch(endpoint);

    // The data might be an object with a 'data' property, or just an array.
    // Adjust the parsing based on what your Google Sheet script returns.
    const result = await res.json(); 

    // Assuming your endpoint returns an object like { data: [...] }
    const entries: DataEntry[] = result.data || result; 

    return {
      props: {
        entries: entries,
      },
      // Incremental Static Regeneration (ISR): Re-generate page every hour (3600s)
      // without needing a full re-build. CRITICAL for fast data updates.
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

// --- 2. Main Page Component ---
interface Props {
  entries: DataEntry[];
}

const HomePage: NextPage<Props> = ({ entries }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <header className="py-4 border-b mb-4">
        <h1 className="text-2xl font-bold text-center text-blue-800">
          Mobile Data Viewer ({entries.length} Entries)
        </h1>
      </header>

      {entries.length > 0 ? (
        <OptimizedList entries={entries} />
      ) : (
        <p className="text-center text-gray-500 mt-10">No data available.</p>
      )}
    </div>
  );
}

export default HomePage;