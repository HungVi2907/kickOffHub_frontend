export default function getApiErrorMessage(error, fallback = 'An error occurred') {
  if (!error) {
    return fallback;
  }

  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}
