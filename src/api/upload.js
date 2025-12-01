// Tự động chọn API URL dựa trên môi trường
const API_BASE_URL = import.meta.env.PROD 
  ? "https://api.kickoffhub.space" 
  : "http://localhost:3000";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Upload thất bại");
  }

  return data.url;
}
