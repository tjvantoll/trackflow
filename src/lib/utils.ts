export function formatDate(dateString: string | undefined) {
  if (!dateString) return "N/A";

  try {
    // Convert UNIX timestamp (seconds) to milliseconds
    const timestamp = Math.floor(parseFloat(dateString)) * 1000;
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return dateString; // Return original string if parsing fails
    }

    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  } catch {
    return dateString; // Return original string if any error occurs
  }
}
