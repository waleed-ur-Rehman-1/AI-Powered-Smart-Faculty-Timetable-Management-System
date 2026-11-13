import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import client from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const res = await client.get("/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{data?.name || user?.email}</Text>
          <Text style={styles.roleBadge}>{user?.role}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ADMIN DASHBOARD */}
      {data?.type === "ADMIN" && (
        <View>
          <Text style={styles.sectionTitle}>University Overview</Text>
          <View style={styles.grid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{data.stats.teachers}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{data.stats.courses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{data.stats.rooms}</Text>
              <Text style={styles.statLabel}>Rooms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {data.stats.scheduledClasses}
              </Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>👑 Admin Privileges</Text>
            <Text style={styles.infoText}>
              Go to the Admin tab to manage users, courses, rooms, and run the
              AI scheduler.
            </Text>
          </View>
        </View>
      )}

      {/* FACULTY DASHBOARD */}
      {data?.type === "FACULTY" && (
        <View>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.grid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{data.stats.todayClasses}</Text>
              <Text style={styles.statLabel}>Today's Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {data.stats.totalWeeklyClasses}
              </Text>
              <Text style={styles.statLabel}>Weekly Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{data.stats.maxHours}</Text>
              <Text style={styles.statLabel}>Max Hours</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {data.todaysSchedule.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                🎉 No classes scheduled for today!
              </Text>
            </View>
          ) : (
            data.todaysSchedule.map((item: any) => (
              <View key={item.id} style={styles.classCard}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{item.timeSlot.startTime}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{item.course.name}</Text>
                  <Text style={styles.classRoom}>📍 {item.classroom.name}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: "#666" },
  name: { fontSize: 24, fontWeight: "bold", color: "#111", marginTop: 2 },
  roleBadge: {
    backgroundColor: "#2563eb",
    color: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#2563eb" },
  statLabel: { fontSize: 13, color: "#666", marginTop: 4 },
  infoCard: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  infoText: { fontSize: 14, color: "#1e40af", lineHeight: 20 },
  emptyCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: { fontSize: 15, color: "#666" },
  classCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  timeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    marginRight: 16,
  },
  timeText: { fontSize: 14, fontWeight: "bold", color: "#2563eb" },
  classInfo: { flex: 1, justifyContent: "center" },
  className: { fontSize: 16, fontWeight: "600", color: "#111" },
  classRoom: { fontSize: 13, color: "#666", marginTop: 4 },
});
