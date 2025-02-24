export function trimText(input: string, maxLength: number = 100): string {
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength - 3) + "...";
}

export function getCurrentTimeInItaly(): Date {
  const nowUTC = new Date();
  const offsetItaly = 2; // Adjust for daylight saving time if needed
  return new Date(nowUTC.getTime() + offsetItaly * 60 * 60 * 1000);
}

export function formatTimeForItaly(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid time";
  }
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Jakarta",
  };

  let formattedTime = new Intl.DateTimeFormat("en-US", options).format(date);
  formattedTime += " GMT"; // Append timezone manually (use a library for better accuracy)

  return formattedTime;
}

export function formatDate(date: Date | undefined | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid date";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
