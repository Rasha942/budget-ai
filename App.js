import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth, getFirebaseIdToken, refreshToken } from "./auth";

import LoginScreen from "./screens/LoginScreen";
import WorkspaceSetupScreen from "./screens/WorkspaceSetupScreen";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SummaryScreen from "./screens/SummaryScreen";
import WorkspaceScreen from "./screens/WorkspaceScreen";
import SetPasswordScreen from "./screens/SetPasswordScreen";
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceIds, setWorkspaceIds] = useState([]);
  const [addingWorkspace, setAddingWorkspace] = useState(false);
  const [loading, setLoading] = useState(true);
  const { request, response, promptAsync } = useGoogleAuth();
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const freshToken = await refreshToken();
        if (freshToken) {
          setToken(freshToken);
          await AsyncStorage.setItem("token", freshToken);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      getFirebaseIdToken(access_token).then((token) => handleSignIn(token, true));
    }
  }, [response]);

  async function restoreSession() {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");
      const savedWorkspaceId = await AsyncStorage.getItem("workspaceId");
      const savedWorkspaceIds = await AsyncStorage.getItem("workspaceIds");

      if (
        savedToken &&
        savedUser &&
        savedWorkspaceId &&
        savedWorkspaceIds &&
        savedUser !== "undefined"
      ) {
        const freshToken = await refreshToken();
        const tokenToUse = freshToken || savedToken;
        setToken(tokenToUse);
        if (freshToken) await AsyncStorage.setItem("token", freshToken);
        setUser(JSON.parse(savedUser));
        setWorkspaceId(savedWorkspaceId);

        try {
          const res = await fetch(
            "https://budget-ai-production-1c70.up.railway.app/user/workspaces",
            { headers: { Authorization: `Bearer ${tokenToUse}` } },
          );
          const data = await res.json();
          const freshIds =
            data.workspaceIds?.length
              ? data.workspaceIds
              : JSON.parse(savedWorkspaceIds);
          setWorkspaceIds(freshIds);
          await AsyncStorage.setItem("workspaceIds", JSON.stringify(freshIds));
        } catch {
          setWorkspaceIds(JSON.parse(savedWorkspaceIds));
        }
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      await AsyncStorage.clear();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(
    firebaseIdToken,
    isGoogleSignIn = false,
    userName = null,
  ) {
    try {
      const response = await fetch(
        "https://budget-ai-production-1c70.up.railway.app/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: firebaseIdToken, userName }),
        },
      );
      const data = await response.json();
      if (data.isNewUser && isGoogleSignIn) {
        setNeedsPassword(true);
      }
      setToken(firebaseIdToken);
      setUser(data.user);
      if (data.workspaceId) {
        setWorkspaceId(data.workspaceId);
        await AsyncStorage.setItem("workspaceId", data.workspaceId);
      }
      setWorkspaceIds(data.workspaceIds || []);

      await AsyncStorage.setItem("token", firebaseIdToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem(
        "workspaceIds",
        JSON.stringify(data.workspaceIds || []),
      );
    } catch (error) {
      console.error("Sign in error:", error);
    }
  }

  async function handleSignOut() {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    setWorkspaceId(null);
  }

  async function handleWorkspaceDeleted() {
    const newWorkspaceIds = workspaceIds.filter((id) => id !== workspaceId);
    setWorkspaceIds(newWorkspaceIds);
    await AsyncStorage.setItem("workspaceIds", JSON.stringify(newWorkspaceIds));
    const nextWorkspaceId = newWorkspaceIds[0] || null;
    setWorkspaceId(nextWorkspaceId);
    if (nextWorkspaceId) {
      await AsyncStorage.setItem("workspaceId", nextWorkspaceId);
    } else {
      await AsyncStorage.removeItem("workspaceId");
    }
  }
  if (loading) return null;

  if (!user) {
    return (
      <LoginScreen
        request={request}
        promptAsync={promptAsync}
        onSignIn={handleSignIn}
      />
    );
  }
  if (needsPassword) {
    return (
      <SetPasswordScreen
        onPasswordSet={async (userName) => {
          await fetch(
            "https://budget-ai-production-1c70.up.railway.app/user/name",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userName }),
            },
          );
          setNeedsPassword(false);
        }}
        user={user}
        token={token}
      />
    );
  }
  if (!workspaceId) {
    return (
      <WorkspaceSetupScreen
        user={user}
        token={token}
        onWorkspaceReady={async (id) => {
          const newIds = [id];
          setWorkspaceIds(newIds);
          setWorkspaceId(id);
          await AsyncStorage.setItem("workspaceIds", JSON.stringify(newIds));
          await AsyncStorage.setItem("workspaceId", id);
        }}
      />
    );
  }
  if (addingWorkspace) {
    return (
      <WorkspaceSetupScreen
        user={user}
        token={token}
        onWorkspaceReady={async (id) => {
          const newIds = [...workspaceIds, id];
          setWorkspaceIds(newIds);
          setWorkspaceId(id);
          await AsyncStorage.setItem("workspaceIds", JSON.stringify(newIds));
          await AsyncStorage.setItem("workspaceId", id);
          setAddingWorkspace(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0e1318",
            borderTopColor: "#1e2832",
          },
          tabBarActiveTintColor: "#00e5a0",
          tabBarInactiveTintColor: "#6a7a8a",
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarLabel: "בית",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>💰</Text>
            ),
          }}
        >
          {() => (
            <HomeScreen token={token} workspaceId={workspaceId} user={user} />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="History"
          options={{
            tabBarLabel: "היסטוריה",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>📋</Text>
            ),
          }}
        >
          {() => <HistoryScreen token={token} workspaceId={workspaceId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Summary"
          options={{
            tabBarLabel: "סיכום",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>📊</Text>
            ),
          }}
        >
          {() => <SummaryScreen token={token} workspaceId={workspaceId} />}
        </Tab.Screen>
        <Tab.Screen
          name="Workspace"
          options={{
            tabBarLabel: "סביבה",
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20 }}>⚙️</Text>
            ),
          }}
        >
          {() => (
            <WorkspaceScreen
              token={token}
              workspaceId={workspaceId}
              workspaceIds={workspaceIds}
              onSignOut={handleSignOut}
              onWorkspaceDeleted={handleWorkspaceDeleted}
              onWorkspaceSwitch={(id) => {
                setWorkspaceId(id);
                AsyncStorage.setItem("workspaceId", id);
              }}
              onAddWorkspace={() => setAddingWorkspace(true)}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
