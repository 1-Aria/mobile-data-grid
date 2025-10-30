export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. 🛑 IMMEDIATE RESPONSE: Send the 200 OK to Zalo right away.
  // This stops the Zalo timeout clock.
  res.status(200).json({ message: "Request accepted and forwarding initiated." }); 

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbx5eUTlDBXu95ZE9pYqo4rOlYNXRBbOifJM819CXGvUmhgS4GgvpwCqvVMa1LeEdAoGYQ/exec";

    // 2. FORWARD ASYNCHRONOUSLY (Fire-and-Forget)
    // The request runs in the background. The Vercel function exits instantly.
    fetch(scriptUrl, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    }).catch(error => {
        // Log errors to your Vercel logs, but Zalo will not see this error.
        console.error("Error sending to AppScript (async):", error);
    });

  } catch (error) {
    // This handles errors that occur before the fetch starts.
    console.error("Error setting up forwarding:", error);
  }
}