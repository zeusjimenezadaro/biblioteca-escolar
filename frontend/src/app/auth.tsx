// Pantalla de retorno del login social: biblioteca://auth?code=... (o ?error=...).
// Canjea el código por la sesión y entra a la app.
import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import Button from "../components/Button";
import Message from "../components/Message";
import { Loading } from "../components/StateViews";

export default function AuthReturn() {
  const { s } = useTheme();
  const { status, completeOAuth } = useAuth();
  const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();
  const [failure, setFailure] = useState(typeof error === "string" ? error : "");

  useEffect(() => {
    if (status === "signedIn") {
      router.replace("/"); // Ya hay sesión: va al inicio.
      return;
    }
    if (typeof code !== "string") return;
    completeOAuth(code).catch((e: Error) => setFailure(e.message));
  }, [code, status, completeOAuth]);

  return (
    <View style={[s.screen, { justifyContent: "center", padding: 24 }]}>
      <View style={s.narrow}>
        {failure ? (
          <>
            <Message type="error" text={failure} />
            <Button label="Volver al inicio de sesión" onPress={() => router.replace("/login")} />
          </>
        ) : (
          <Loading text="Iniciando sesión…" />
        )}
      </View>
    </View>
  );
}
