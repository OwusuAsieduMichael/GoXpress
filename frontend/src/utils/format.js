export const currency = (value) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS"
  }).format(Number(value || 0));

export const dateTime = (value) =>
  new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
