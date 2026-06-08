import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

const firebaseConfig = {
  apiKey: "AIzaSyDCIPYEkkvkBtOM-SG4rzmHv9WTKh7qBpg",
  authDomain: "ai-budget-30e24.firebaseapp.com",
  projectId: "ai-budget-30e24",
  storageBucket: "ai-budget-30e24.firebasestorage.app",
  messagingSenderId: "878270972278",
  appId: "1:878270972278:web:beec6f41725c07a449fa57",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "878270972278-22344lcv57s76up31nc8iauiolmv3t3f.apps.googleusercontent.com",
    iosClientId:
      "869872520581-m0mnan19clvbbcid2i5qubvt48sa9g2u.apps.googleusercontent.com",
    webClientId:
      "878270972278-22344lcv57s76up31nc8iauiolmv3t3f.apps.googleusercontent.com",
  });

  return { request, response, promptAsync };
}

export async function getFirebaseIdToken(googleAccessToken) {
  const credential = GoogleAuthProvider.credential(null, googleAccessToken);
  const userCredential = await signInWithCredential(auth, credential);
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}
