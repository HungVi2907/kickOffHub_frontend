// Tự động chọn API URL dựa trên môi trường
const API_BASE_URL = import.meta.env.PROD 
  ? "https://api.kickoffhub.space" 
  : "http://localhost:3000";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  // Kiểm tra response có phải JSON không
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Server trả về không phải JSON:", text.substring(0, 200));
    throw new Error("Server error: Không thể xử lý response");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || data.error || "Upload thất bại");
  }

  return data.url;
}
