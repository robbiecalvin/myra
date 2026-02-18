import * as Location from "expo-location";
import { Linking } from "react-native";

export const openNearbyStores = async (): Promise<boolean> => {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    return false;
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;
  const query = encodeURIComponent(`liquor store near ${latitude},${longitude}`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

  await Linking.openURL(url);
  return true;
};
