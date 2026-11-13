import { StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{user?.role}</Text>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{user?.faculty?.name ?? "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  label: { fontSize: 12, color: "#666", marginTop: 16 },
  value: { fontSize: 18, fontWeight: "500", marginTop: 4 },
});
