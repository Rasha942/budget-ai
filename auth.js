import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, ResponseType } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      responseType: ResponseType.IdToken,
      expoClientId:
        "869872520581-1hrhuvilfeerd54d4g1lnq7o4cd0jrdd.apps.googleusercontent.com",
      iosClientId:
        "869872520581-m0mnan19clvbbcid2i5qubvt48sa9g2u.apps.googleusercontent.com",
      webClientId:
        "869872520581-1hrhuvilfeerd54d4g1lnq7o4cd0jrdd.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    },
    { useProxy: true },
  );

  return { request, response, promptAsync };
}
