import client from "./client";

export const fetchDashboardData = async () => {
  const response = await client.get("/dashboard");
  return response.data;
};
