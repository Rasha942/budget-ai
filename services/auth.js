import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "your_ios_client_id_here",
    webClientId: "your_web_client_id_here",
  });

  return { request, response, promptAsync };
}
