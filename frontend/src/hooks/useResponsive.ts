// Datos del tamaño de pantalla para adaptar el diseño (celular, tablet, horizontal).
import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions(); // Se actualiza al girar el celular.
  const landscape = width > height;
  // Cantidad de columnas de las grillas según el ancho disponible.
  const columns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  return { width, height, landscape, columns, isWide: width >= 640 };
}
