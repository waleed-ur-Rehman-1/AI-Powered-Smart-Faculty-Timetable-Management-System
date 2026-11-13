import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchMySchedule } from "../../api/timetable";

export default function TimetableScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await fetchMySchedule();
      setSchedule(data);
    } catch (error) {
      console.error("Failed to load schedule", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.timeBox}>
        <Text style={styles.day}>Day {item.timeSlot.dayOfWeek}</Text>
        <Text style={styles.time}>{item.timeSlot.startTime}</Text>
      </View>
      <View style={styles.detailsBox}>
        <Text style={styles.course}>
          {item.course.name} ({item.course.code})
        </Text>
        <Text style={styles.room}>📍 {item.classroom.name}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={schedule}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No classes scheduled.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBox: {
    width: 80,
    borderRightWidth: 1,
    borderColor: "#eee",
    paddingRight: 10,
  },
  day: { fontSize: 12, color: "#666", fontWeight: "bold" },
  time: { fontSize: 16, fontWeight: "bold", color: "#2563eb", marginTop: 4 },
  detailsBox: { flex: 1, paddingLeft: 16, justifyContent: "center" },
  course: { fontSize: 16, fontWeight: "600" },
  room: { fontSize: 14, color: "#666", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
});
