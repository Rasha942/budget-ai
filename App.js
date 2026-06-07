import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "./auth";

import LoginScreen from "./screens/LoginScreen";
import WorkspaceSetupScreen from "./screens/WorkspaceSetupScreen";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SummaryScreen from "./screens/SummaryScreen";
import WorkspaceScreen from "./screens/WorkspaceScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      handleSignIn(access_token);
    }
  }, [response]);

  async function restoreSession() {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      const savedUser = await AsyncStorage.getItem("user");
      const savedWorkspaceId = await AsyncStorage.getItem("workspaceId");
      if (
        savedToken &&
        savedUser &&
        savedWorkspaceId &&
        savedUser !== "undefined"
      ) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setWorkspaceId(savedWorkspaceId);
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      await AsyncStorage.clear();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(accessToken) {
    try {
      const response = await fetch(
        "https://budget-ai-production-1c70.up.railway.app/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: accessToken }),
        },
      );
      const data = await response.json();
      setToken(accessToken);
      setUser(data.user);
      setWorkspaceId(data.workspaceId);
      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("workspaceId", data.workspaceId);
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
    await AsyncStorage.removeItem("workspaceId");
    setWorkspaceId(null);
  }

  if (loading) return null;

  if (!user) {
    return <LoginScreen request={request} promptAsync={promptAsync} />;
  }

  if (!workspaceId) {
    return (
      <WorkspaceSetupScreen
        user={user}
        token={token}
        onWorkspaceReady={(id) => setWorkspaceId(id)}
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
              user={user}
              onSignOut={handleSignOut}
              onWorkspaceDeleted={handleWorkspaceDeleted}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
