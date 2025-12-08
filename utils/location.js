import * as Location from "expo-location";

export async function requestAndSaveLocation(uid) {
  try {
    // 1. Kërko leje
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Leja për lokacion nuk u dhënë.");
      return null;
    }

    // 2. Merre lokacionin aktual
    const loc = await Location.getCurrentPositionAsync({});
    if (!loc) return null;

    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;

    console.log("Lokacion i marrë:", { latitude, longitude });

    // 3. Reverse geocoding → gjej qytetin
    const geo = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    let city = "Prishtina";

    if (geo && geo.length > 0) {
      city = geo[0]?.city || geo[0]?.region || "Prishtina";
    }

    console.log("Qyteti i detektuar:", city);

    // 4. Kthe objektin final
    const finalLocation = {
      latitude,
      longitude,
      city,
    };

    console.log("Lokacioni i përdoruesit:", finalLocation);

    return finalLocation;
  } catch (err) {
    console.log("Gabim në marrjen e lokacionit:", err);
    return null;
  }
}