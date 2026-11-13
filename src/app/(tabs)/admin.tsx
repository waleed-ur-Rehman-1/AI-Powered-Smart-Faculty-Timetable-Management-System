import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import client from "../../api/client";

export default function AdminScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);

  // Input states
  const [tName, setTName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [cCode, setCCode] = useState("");
  const [cName, setCName] = useState("");
  const [rName, setRName] = useState("");
  const [rCap, setRCap] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchAdminData();
    }, []),
  );

  const fetchAdminData = async () => {
    try {
      const res = await client.get("/admin/data");
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await client.post("/admin/generate");
      Alert.alert("Success", `AI generated ${res.data.count} classes!`);
      fetchAdminData();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!tName || !tEmail) return Alert.alert("Error", "Enter name and email");
    try {
      await client.post("/admin/faculty", { name: tName, email: tEmail });
      Alert.alert("Success", "Teacher added!");
      setShowTeacherForm(false);
      setTName("");
      setTEmail("");
      fetchAdminData();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Failed");
    }
  };

  const handleAddCourse = async () => {
    if (!cCode || !cName) return Alert.alert("Error", "Enter code and name");
    try {
      await client.post("/admin/courses", { code: cCode, name: cName });
      Alert.alert("Success", "Course added!");
      setShowCourseForm(false);
      setCCode("");
      setCName("");
      fetchAdminData();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Failed");
    }
  };

  const handleAddRoom = async () => {
    if (!rName || !rCap)
      return Alert.alert("Error", "Enter room name and capacity");
    try {
      await client.post("/admin/rooms", { name: rName, capacity: rCap });
      Alert.alert("Success", "Room added!");
      setShowRoomForm(false);
      setRName("");
      setRCap("");
      fetchAdminData();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Failed");
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAdminData();
          }}
        />
      }
    >
      <Text style={styles.title}>👑 Admin Dashboard</Text>

      {/* AI Generation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Engine</Text>
        <Text style={styles.cardText}>
          Classes scheduled: {data?.scheduledClassesCount || 0}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🧠 Generate Timetable</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Faculty Section */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            👨‍🏫 Faculty ({data?.teachers?.length || 0})
          </Text>
          <TouchableOpacity
            onPress={() => setShowTeacherForm(!showTeacherForm)}
          >
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showTeacherForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={tName}
              onChangeText={setTName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={tEmail}
              onChangeText={setTEmail}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAddTeacher}
            >
              <Text style={styles.submitText}>Save Teacher</Text>
            </TouchableOpacity>
          </View>
        )}
        {data?.teachers?.map((t: any) => (
          <View key={t.id} style={styles.listItem}>
            <Text style={styles.itemName}>{t.faculty?.name}</Text>
            <Text style={styles.itemSub}>{t.email}</Text>
          </View>
        ))}
      </View>

      {/* Courses Section */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            📚 Courses ({data?.courses?.length || 0})
          </Text>
          <TouchableOpacity onPress={() => setShowCourseForm(!showCourseForm)}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showCourseForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Course Code (e.g. CS104)"
              value={cCode}
              onChangeText={setCCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={cName}
              onChangeText={setCName}
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAddCourse}
            >
              <Text style={styles.submitText}>Save Course</Text>
            </TouchableOpacity>
          </View>
        )}
        {data?.courses?.map((c: any) => (
          <View key={c.id} style={styles.listItem}>
            <Text style={styles.itemName}>
              {c.code} - {c.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Rooms Section */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            🏫 Rooms ({data?.rooms?.length || 0})
          </Text>
          <TouchableOpacity onPress={() => setShowRoomForm(!showRoomForm)}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {showRoomForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Room Name"
              value={rName}
              onChangeText={setRName}
            />
            <TextInput
              style={styles.input}
              placeholder="Capacity"
              value={rCap}
              onChangeText={setRCap}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddRoom}>
              <Text style={styles.submitText}>Save Room</Text>
            </TouchableOpacity>
          </View>
        )}
        {data?.rooms?.map((r: any) => (
          <View key={r.id} style={styles.listItem}>
            <Text style={styles.itemName}>{r.name}</Text>
            <Text style={styles.itemSub}>Capacity: {r.capacity}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginTop: 10, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  cardText: { fontSize: 14, color: "#666", marginVertical: 10 },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addText: { color: "#2563eb", fontSize: 16, fontWeight: "bold" },
  form: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  listItem: { borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 10 },
  itemName: { fontSize: 16, fontWeight: "500", color: "#111" },
  itemSub: { fontSize: 13, color: "#666", marginTop: 2 },
});
