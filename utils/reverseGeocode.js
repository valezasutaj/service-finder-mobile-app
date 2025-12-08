export async function getCityFromCoordinates(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    const res = await fetch(url);
    const data = await res.json();

    // emri i qytetit më shpesh është këtu:
    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.municipality ||
      "Unknown"
    );
  } catch (e) {
    console.log("Reverse geocode error:", e);
    return "Unknown";
  }
}
