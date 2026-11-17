// Ruta inexistente o protegida (por ejemplo «/» sin sesión): redirige al login o al inicio.
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { status } = useAuth();
  return <Redirect href={status === "signedIn" ? "/" : "/login"} />;
}
