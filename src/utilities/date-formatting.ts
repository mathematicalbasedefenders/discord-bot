function formatDate(ISODate: string) {
  const dateObject = new Date(ISODate);
  return dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function formatFooterDate(date: Date) {
  const mdy = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const hms = date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour12: false,
    timeZoneName: "short"
  });
  return `${mdy} ${hms}`;
}

export { formatDate, formatFooterDate };
