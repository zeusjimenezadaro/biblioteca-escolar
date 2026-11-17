// Carga datos de la API con estados de carga, error y recarga.
// Vuelve a cargar cada vez que la pantalla aparece (por ejemplo, al volver de editar un libro)
// y cuando cambian los filtros indicados en «deps».
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

export function useLoader<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Primera carga.
  const [refreshing, setRefreshing] = useState(false); // «Tirar para actualizar».
  const loadRef = useRef(load); // Siempre la versión más nueva de la función de carga.
  const loaded = useRef(false); // ¿Ya se cargó al menos una vez?

  useLayoutEffect(() => {
    loadRef.current = load;
  });

  const run = useCallback(async (mode: "first" | "refresh" | "silent") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      setData(await loadRef.current());
      setError("");
      loaded.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Clave de los filtros: cuando cambia, se vuelve a cargar.
  const key = JSON.stringify(deps);
  useFocusEffect(
    useCallback(() => {
      run(loaded.current ? "silent" : "first"); // Sin tapar lo que ya se ve en pantalla.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- «key» fuerza la recarga al cambiar los filtros.
    }, [key, run]),
  );

  return {
    data,
    setData,
    error,
    loading,
    refreshing,
    refresh: () => run("refresh"),
    retry: () => {
      setLoading(true);
      run("first");
    },
  };
}
