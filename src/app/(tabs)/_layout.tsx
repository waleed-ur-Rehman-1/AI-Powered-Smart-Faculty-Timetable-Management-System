import { Tabs } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />

      {/* Show Admin panel ONLY to Admins */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: isAdmin ? "/admin" : null, // Hide from teachers
        }}
      />

      {/* Show Timetable ONLY to Teachers */}
      <Tabs.Screen
        name="timetable"
        options={{
          title: "Timetable",
          href: isAdmin ? null : "/timetable", // Hide from admins
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
