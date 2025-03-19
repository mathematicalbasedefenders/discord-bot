function formatDate(ISODate: string) {
  const dateObject = new Date(ISODate);
  return dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export { formatDate };
