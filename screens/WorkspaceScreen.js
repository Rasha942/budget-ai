import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
  TextInput,
  Alert,
  Platform,
  Modal,
} from "react-native";

const SERVER = "https://budget-ai-production-1c70.up.railway.app";

export default function WorkspaceScreen({
  token,
  workspaceId,
  workspaceIds,
  onSignOut,
  onWorkspaceDeleted,
  onWorkspaceSwitch,
  onAddWorkspace,
}) {
  const [workspace, setWorkspace] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchWorkspace();
    fetchAllWorkspaces();
  }, [workspaceId]);

  async function fetchWorkspace() {
    try {
      const response = await fetch(`${SERVER}/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWorkspace(data);
      setNewName(data.name);
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllWorkspaces() {
    try {
      const results = await Promise.all(
        workspaceIds.map(async (id) => {
          const response = await fetch(`${SERVER}/workspace/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          return { id, name: data.name };
        }),
      );
      setAllWorkspaces(results);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  }

  function handleSwitch(id) {
    setShowSwitchModal(false);
    onWorkspaceSwitch(id);
  }

  async function handleRename() {
    try {
      await fetch(`${SERVER}/workspace/${workspaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      setWorkspace({ ...workspace, name: newName });
      setEditing(false);
    } catch (error) {
      console.error("Error renaming workspace:", error);
    }
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `האם אתה בטוח שברצונך למחוק את "${workspace.name}"? פעולה זו אינה הפיכה.`,
      );
      if (confirmed) handleDelete();
    } else {
      Alert.alert(
        "מחיקת סביבה",
        `האם אתה בטוח שברצונך למחוק את "${workspace.name}"? פעולה זו אינה הפיכה.`,
        [
          { text: "ביטול", style: "cancel" },
          { text: "מחק", style: "destructive", onPress: handleDelete },
        ],
      );
    }
  }

  async function handleDelete() {
    try {
      await fetch(`${SERVER}/workspace/${workspaceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      onWorkspaceDeleted();
    } catch (error) {
      console.error("Error deleting workspace:", error);
    }
  }

  async function shareInviteCode() {
    try {
      await Share.share({
        message: `הצטרף לסביבת התקציב שלי! קוד הזמנה: ${workspace.inviteCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  if (loading)
    return (
      <ActivityIndicator style={styles.loader} color="#00e5a0" size="large" />
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ סביבת עבודה</Text>

      {/* Switch workspace modal */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSwitchModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>סביבות עבודה</Text>
            {allWorkspaces.map((ws) => (
              <TouchableOpacity
                key={ws.id}
                style={styles.modalItem}
                onPress={() => handleSwitch(ws.id)}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    ws.id === workspaceId && { color: "#00e5a0" },
                  ]}
                >
                  {ws.name} {ws.id === workspaceId ? "✓" : ""}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowSwitchModal(false)}>
              <Text style={styles.cancel}>סגור</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {workspace && (
        <>
          <View style={styles.card}>
            {editing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholderTextColor="#6a7a8a"
                />
                <TouchableOpacity style={styles.button} onPress={handleRename}>
                  <Text style={styles.buttonText}>שמור שם</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Text style={styles.cancel}>ביטול</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>{workspace.name}</Text>
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Text style={styles.editLink}>✏️ שנה שם</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.label}>בעלים: {workspace.ownerName}</Text>
            <Text style={styles.label}>חברים: {workspace.members?.length}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>קוד הזמנה</Text>
            <Text style={styles.inviteCode}>{workspace.inviteCode}</Text>
            <Text style={styles.expiry}>
              {workspace.inviteUsed
                ? "⚠️ קוד כבר שומש"
                : `תוקף עד: ${new Date(workspace.inviteExpiry).toLocaleDateString()}`}
            </Text>
            <TouchableOpacity style={styles.button} onPress={shareInviteCode}>
              <Text style={styles.buttonText}>שתף קוד הזמנה</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>חברים</Text>
            {workspace.members?.map((email) => (
              <Text key={email} style={styles.member}>
                👤 {email}
              </Text>
            ))}
          </View>

          {workspaceIds.length > 1 && (
            <TouchableOpacity
              style={[styles.button, { marginBottom: 12 }]}
              onPress={() => setShowSwitchModal(true)}
            >
              <Text style={styles.buttonText}>🔄 החלף סביבה</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { marginBottom: 16, backgroundColor: "#1e2832" },
            ]}
            onPress={() => onAddWorkspace()}
          >
            <Text style={[styles.buttonText, { color: "#00e5a0" }]}>
              ➕ הוסף סביבה
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
            <Text style={styles.deleteText}>🗑️ מחק סביבה</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutText}>התנתק</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c10",
    padding: 24,
    paddingTop: 60,
  },
  loader: { flex: 1, backgroundColor: "#080c10" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00e5a0",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#0e1318",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#00e5a0",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  label: { color: "#eaf0f8", fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: "#080c10",
    color: "#eaf0f8",
    borderColor: "#00e5a0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#00e5a0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: "#080c10", fontWeight: "bold" },
  editLink: { color: "#4da8ff", fontSize: 13, marginBottom: 8 },
  cancel: { color: "#6a7a8a", textAlign: "center", marginTop: 8 },
  inviteCode: {
    color: "#00e5a0",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    marginVertical: 12,
  },
  expiry: {
    color: "#6a7a8a",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  member: { color: "#eaf0f8", fontSize: 14, paddingVertical: 4 },
  deleteButton: {
    borderColor: "#ff6b6b",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  deleteText: { color: "#ff6b6b", fontWeight: "bold", fontSize: 16 },
  signOutButton: {
    borderColor: "#6a7a8a",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 48,
  },
  signOutText: { color: "#6a7a8a", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#0e1318",
    borderColor: "#1e2832",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    color: "#00e5a0",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomColor: "#1e2832",
    borderBottomWidth: 1,
  },
  modalItemText: {
    color: "#eaf0f8",
    fontSize: 15,
    textAlign: "center",
  },
});
