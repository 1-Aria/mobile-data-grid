// --- API Client Utility (src/utils/api_client.ts) ---

// IMPORTANT: Replace this with your actual Cloud Run URL
const CLOUD_RUN_ENDPOINT = "https://quangphuong-1038729809041.asia-southeast1.run.app/maintenance";

/**
 * Submits an action payload to the Cloud Run backend service.
 * * @param action The specific action string (e.g., 'register_incident', 'submit_report').
 * @param data The payload containing form fields, including the PIN.
 * @returns true if submission was successful, false otherwise.
 */
export const submitAction = async (action: string, data: Record<string, string>): Promise<boolean> => {
    // In a real application, replace this with your actual environment variable access.
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "YOUR_DUMMY_API_KEY_FOR_LOCAL_TESTING"; 

    const payload = {
        action: action,
        data: data,
    };

    console.log(`[API] Sending payload for action '${action}':`, payload);

    try {
        const response = await fetch(CLOUD_RUN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey, // Your private key header
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Try to parse error message from the backend response body
            const errorBody = await response.json().catch(() => ({ message: "Unknown error during submission." }));
            throw new Error(`Submission failed (Status: ${response.status}): ${errorBody.message || JSON.stringify(errorBody)}`);
        }

        console.log(`[API] ✅ Success for action '${action}'. Response:`, await response.json());
        return true;

    } catch (error) {
        console.error(`[API] 🚨 Error submitting action '${action}':`, error);
        // Implement user-facing error notification here
        return false;
    }
};