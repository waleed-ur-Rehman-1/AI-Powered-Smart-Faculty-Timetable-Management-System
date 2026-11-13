import client from "./client";

export const fetchMySchedule = async () => {
  const response = await client.get("/timetable/my-schedule");
  return response.data;
};
