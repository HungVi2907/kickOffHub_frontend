export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://kickoffhub.space/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Upload thất bại");
  }

  return data.url;
}
