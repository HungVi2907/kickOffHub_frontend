// Automatically select API URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? "https://api.kickoffhub.space" 
  : "http://localhost:3000";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  // Check if response is JSON
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Server returned non-JSON response:", text.substring(0, 200));
    throw new Error("Server error: Unable to process response");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Upload failed");
  }

  return data.url;
}
