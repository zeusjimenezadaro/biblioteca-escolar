// Grilla que cambia la cantidad de columnas según el ancho de la pantalla (1 en celular vertical).
import { Children } from "react";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useResponsive } from "../hooks/useResponsive";

type Props = { children: ReactNode; min?: number }; // min: columnas mínimas (ej.: 2 para estadísticas).

export default function Grid({ children, min = 1 }: Props) {
  const { columns } = useResponsive();
  const cols = Math.max(min, columns);
  const gap = 12;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {Children.toArray(children).map((child, i) => (
        <View key={i} style={{ width: `${100 / cols}%`, paddingHorizontal: gap / 2, paddingBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}
