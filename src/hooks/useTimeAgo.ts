// src/hooks/useTimeAgo.ts (Requires 'date-fns' library for easy formatting)

import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Calculates and returns the time elapsed since the given date, updating every minute.
 * @param date - The date to calculate the duration from (must be a valid Date object).
 * @returns A string like "5 minutes ago" or "2 days ago".
 */
const useTimeAgo = (date: Date): string => {
    // State to hold the formatted string. Initialize with the current duration.
    const [timeAgo, setTimeAgo] = useState(() => 
        formatDistanceToNowStrict(date, { addSuffix: true })
    );

    useEffect(() => {
        // Set up the interval to recalculate the time every 60 seconds (1 minute).
        const intervalId = setInterval(() => {
            setTimeAgo(formatDistanceToNowStrict(date, { addSuffix: true, locale: vi }));
        }, 60000); // 60 seconds

        // Cleanup function to clear the interval when the component unmounts or date changes.
        return () => clearInterval(intervalId);
    }, [date]); 

    return timeAgo;
};

export default useTimeAgo;