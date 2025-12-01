export default function getApiErrorMessage(error, fallback = 'Đã có lỗi xảy ra') {
  if (!error) {
    return fallback
  }

  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    fallback
  )
}
