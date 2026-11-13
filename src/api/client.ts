import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Auto-detects your PC's IP from the Expo dev server
// Works on physical device, Android emulator, and iOS simulator
const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
export const API_URL = `http://${host}:5000/api`;

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
