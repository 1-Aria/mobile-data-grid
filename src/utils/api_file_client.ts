// --- API File Client Utility (src/utils/api_file_client.ts) ---

// IMPORTANT: Use the same endpoint
const CLOUD_RUN_ENDPOINT = "https://quangphuong-1038729809041.asia-southeast1.run.app/maintenance";

/**
 * Submits an action payload that may contain an optional file (image) to the Cloud Run backend.
 * Uses FormData for transport.
 * * @param action The specific action string (e.g., 'submit_report').
 * @param data The payload containing form fields.
 * @param file Optional file object to upload.
 * @returns true if submission was successful, false otherwise.
 */
export const submitFileAction = async (
    action: string, 
    data: Record<string, string>,
    file: File | null
): Promise<boolean> => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "YOUR_DUMMY_API_KEY_FOR_LOCAL_TESTING"; 

    // 1. Build the FormData payload
    const formData = new FormData();
    formData.append('action', action); // Add action type

    // Append all text fields from the form data
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    // Append the file (if one was selected)
    if (file) {
        // 'image' must match the expected field name in your Cloud Run service
        formData.append('image', file, file.name); 
    }
    
    console.log(`[API File] Sending action '${action}' with file status: ${file ? 'ATTACHED' : 'NONE'}`);

    try {
        const response = await fetch(CLOUD_RUN_ENDPOINT, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                // IMPORTANT: DO NOT set Content-Type here; fetch handles multipart/form-data
            },
            body: formData, 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Submission failed (Status: ${response.status}): ${errorText}`);
        }
        
        console.log("[API File] ✅ Success. Response:", await response.json());
        return true;

    } catch (error) {
        console.error("🚨 Error submitting file action:", error);
        return false;
    }
};