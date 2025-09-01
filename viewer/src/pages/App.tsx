import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { Box, CssBaseline, Typography, CircularProgress } from "@mui/material";
import Scene from "../components/Scene";
import { Canvas } from "@react-three/fiber";

export default function HomePage() {
  // Map<id, url>
  const [fileUrlMap, setFileUrlMap] = useState<Map<string, string>>(new Map());
  const prevFileUrlMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    // 이전 Map에서 사라진 Blob URL만 해제
    prevFileUrlMap.current.forEach((url, id) => {
      if (url.startsWith("blob:") && !fileUrlMap.has(id)) {
        URL.revokeObjectURL(url);
      }
    });
    prevFileUrlMap.current = new Map(fileUrlMap);
  }, [fileUrlMap]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newEntries: [string, string][] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith(".gltf") || file.name.endsWith(".glb")) {
        const url =
          URL.createObjectURL(file) + "?name=" + encodeURIComponent(file.name);
        const id = crypto.randomUUID();
        newEntries.push([id, url]);
      }
    }
    if (newEntries.length > 0) {
      setFileUrlMap((prev) => {
        const next = new Map(prev);
        newEntries.forEach(([id, url]) => next.set(id, url));
        return next;
      });
    }
  }, []);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100vh" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <CssBaseline />
      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <Suspense
          fallback={
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress color="inherit" />
              <Typography sx={{ ml: 2 }}>Loading 3D Scene...</Typography>
            </Box>
          }
        >
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [5, 5, 5], fov: 50 }}
              shadows
              dpr={[1, 2]}
              gl={{
                preserveDrawingBuffer: false,
                powerPreference: "high-performance",
              }}
            >
              <Scene fileUrlMap={fileUrlMap} />
            </Canvas>
          </Suspense>
        </Suspense>
        {fileUrlMap.size === 0 && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              pointerEvents: "none",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5">Drop GLTF / GLB file here</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
