import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

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
