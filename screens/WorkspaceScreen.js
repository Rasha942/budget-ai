import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { Paper, Stamp, Perforation, LeaderLine, Button, Field, Icon } from "../components/receipt";
import { colors, fonts } from "../theme/receipt";

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
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName }),
      });
      setWorkspace({ ...workspace, name: newName });
      setEditing(false);
    } catch (error) {
      console.error("Error renaming workspace:", error);
    }
  }

  function confirmDelete() {
    const msg = `האם אתה בטוח שברצונך למחוק את "${workspace.name}"? פעולה זו אינה הפיכה.`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) handleDeleteWorkspace();
    } else {
      Alert.alert("מחיקת סביבה", msg, [
        { text: "ביטול", style: "cancel" },
        { text: "מחק", style: "destructive", onPress: handleDeleteWorkspace },
      ]);
    }
  }

  async function handleDeleteWorkspace() {
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

  async function handleDeleteAccount() {
    try {
      await fetch(`${SERVER}/user`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      onSignOut();
    } catch (error) {
      console.error("Error deleting account:", error);
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.ink} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>סביבה</Text>

      {workspace && (
        <>
          {/* workspace receipt */}
          <Paper>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>Workspace</Text>
              <Stamp label="OWNER" tone="ink" />
            </View>
            <Perforation />
            {editing ? (
              <>
                <Field
                  label="שם הסביבה"
                  value={newName}
                  onChangeText={setNewName}
                  style={{ marginTop: 0 }}
                />
                <View style={styles.rowGap}>
                  <Button label="שמור שם" icon="save" variant="gold" onPress={handleRename} style={{ flex: 1 }} />
                  <Button label="ביטול" variant="ghost" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.nameRow} onPress={() => setEditing(true)} activeOpacity={0.7}>
                <Text style={styles.wsName}>{workspace.name}</Text>
                <Icon name="pencil" size={15} color={colors.muted} />
              </TouchableOpacity>
            )}
            <LeaderLine label="בעלים" value={workspace.ownerName} />
            <LeaderLine label="חברים" value={String(workspace.members?.length || 0)} />
          </Paper>

          {/* invite code */}
          <Paper flat style={{ marginTop: 14 }}>
            <Text style={styles.cardLabel}>INVITE CODE · קוד הזמנה</Text>
            <Text style={styles.invite}>{workspace.inviteCode}</Text>
            <Text style={styles.expiry}>
              {workspace.inviteUsed
                ? "⚠ קוד כבר שומש"
                : `תוקף עד ${new Date(workspace.inviteExpiry).toLocaleDateString("he-IL")}`}
            </Text>
            <Button label="שתף קוד הזמנה" icon="share" variant="gold" onPress={shareInviteCode} style={{ marginTop: 12 }} />
          </Paper>

          {/* members */}
          <Paper flat style={{ marginTop: 14 }}>
            <Text style={styles.cardLabel}>MEMBERS · חברים</Text>
            {workspace.members?.map((email) => (
              <View key={email} style={styles.member}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(email[0] || "?").toUpperCase()}</Text>
                </View>
                <Text style={styles.memberEmail}>{email}</Text>
              </View>
            ))}
          </Paper>

          {workspaceIds.length > 1 && (
            <Button
              label="החלף סביבה"
              icon="swap"
              variant="ghost"
              onPress={() => setShowSwitchModal(true)}
              style={{ marginTop: 16 }}
            />
          )}
          <Button label="הוסף סביבה" icon="plus" variant="gold" onPress={onAddWorkspace} style={{ marginTop: 10 }} />
          <Button label="מחק סביבה" icon="trash" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} />
        </>
      )}

      <View style={styles.divider} />
      <Button label="התנתק" variant="ghost" onPress={onSignOut} />
      <Button
        label="מחק חשבון"
        icon="trash"
        variant="danger"
        onPress={() => setShowDeleteConfirm(true)}
        style={{ marginTop: 10 }}
      />

      {/* switch modal */}
      <Modal visible={showSwitchModal} transparent animationType="fade" onRequestClose={() => setShowSwitchModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSwitchModal(false)}>
          <View style={styles.modalCard}>
            <Paper flat>
              <Text style={styles.modalTitle}>החלף סביבה</Text>
              <Perforation />
              {allWorkspaces.map((ws) => (
                <TouchableOpacity key={ws.id} style={styles.member} onPress={() => handleSwitch(ws.id)}>
                  <View style={[styles.avatar, ws.id !== workspaceId && { backgroundColor: colors.muted }]}>
                    <Text style={styles.avatarText}>{(ws.name[0] || "?").toUpperCase()}</Text>
                  </View>
                  <Text style={styles.memberEmail}>{ws.name}</Text>
                  {ws.id === workspaceId && (
                    <View style={{ marginStart: "auto" }}>
                      <Icon name="check" size={16} color={colors.ink} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <Button
                label="הוסף סביבה"
                icon="plus"
                variant="gold"
                onPress={() => {
                  setShowSwitchModal(false);
                  onAddWorkspace();
                }}
                style={{ marginTop: 14 }}
              />
              <TouchableOpacity onPress={() => setShowSwitchModal(false)}>
                <Text style={styles.close}>סגור</Text>
              </TouchableOpacity>
            </Paper>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* delete account modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowDeleteConfirm(false)}>
          <View style={styles.modalCard}>
            <Paper flat>
              <Text style={styles.modalTitle}>מחיקת חשבון</Text>
              <Text style={styles.modalBody}>כתוב "מחק" לאישור מחיקת החשבון</Text>
              <Field
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="מחק"
                style={{ marginTop: 4 }}
              />
              <Button
                label="מחק חשבון"
                variant="danger"
                disabled={deleteConfirmText !== "מחק"}
                onPress={() => {
                  if (deleteConfirmText === "מחק") {
                    setShowDeleteConfirm(false);
                    handleDeleteAccount();
                  }
                }}
                style={{ marginTop: 14 }}
              />
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.close}>ביטול</Text>
              </TouchableOpacity>
            </Paper>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ground },
  loader: { flex: 1, backgroundColor: colors.ground, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.handHe, fontSize: 30, color: colors.text, marginBottom: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: fonts.handLat, color: colors.ink, fontSize: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  wsName: { fontFamily: fonts.handHe, fontSize: 26, color: colors.text },
  rowGap: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 4 },
  cardLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.8, color: colors.sub, textAlign: "right" },
  invite: {
    fontFamily: fonts.monoSemi,
    fontSize: 30,
    letterSpacing: 8,
    color: colors.ink,
    textAlign: "center",
    marginVertical: 12,
  },
  expiry: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, textAlign: "center" },
  member: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.handHe, fontSize: 14, color: colors.gold },
  memberEmail: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  divider: { height: 1.5, borderTopWidth: 1.5, borderStyle: "dashed", borderColor: colors.field, marginVertical: 22 },
  overlay: { flex: 1, backgroundColor: "rgba(34,31,24,0.45)", alignItems: "center", justifyContent: "center", padding: 28 },
  modalCard: { width: "100%" },
  modalTitle: { fontFamily: fonts.handHe, fontSize: 24, color: colors.text, textAlign: "center" },
  modalBody: { fontFamily: fonts.body, fontSize: 13, color: colors.sub, textAlign: "center", marginTop: 8 },
  close: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 12 },
});
