// Avisos emergentes («Libro agregado», «Préstamo aprobado»): aparecen arriba y se ocultan solos.
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

type Toast = { type: "success" | "error"; text: string };
const ToastContext = createContext<(toast: Toast) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const { s, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);
  const [anim] = useState(() => new Animated.Value(0)); // 0 = oculto, 1 = visible.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (next: Toast) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(next);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
      // Se oculta solo a los 3 segundos.
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
      }, 3000);
    },
    [anim],
  );

  const ok = toast?.type === "success";
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.toast,
            {
              top: insets.top + 12,
              backgroundColor: ok ? colors.successSoft : colors.errorSoft,
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            },
          ]}
        >
          <Ionicons name={ok ? "checkmark-circle" : "alert-circle"} size={22} color={ok ? colors.success : colors.error} />
          <Text accessibilityLiveRegion="polite" style={{ flex: 1, fontSize: 15, fontWeight: "600", color: ok ? colors.success : colors.error }}>
            {toast.text}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

// Uso: const toast = useToast(); toast({ type: "success", text: "Guardado." })
export const useToast = () => useContext(ToastContext);
