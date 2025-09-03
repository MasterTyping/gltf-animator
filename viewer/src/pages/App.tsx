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
import { OrthographicCamera } from "@react-three/drei";
import HierarchyPanel from "../components/interface/HierarchyPanel";
import { useSceneStore } from "../store";
import Inspector from "../components/interface/Inspector";
import type { WebGLRenderer } from "three";
import AnimationTimeline from "../components/interface/AnimationViewer";

export default function HomePage() {
  // Map<id, url>
  const [fileUrlMap, setFileUrlMap] = useState<Map<string, string>>(new Map());
  const prevFileUrlMap = useRef<Map<string, string>>(new Map());
  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );

  // ref to the GL renderer so we can force context loss on unmount
  const glRef = useRef<WebGLRenderer | null>(null);

  useEffect(() => {
    const cleanup = () => {
      prevFileUrlMap.current.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      // force context loss + dispose
      const gl = glRef.current;
      if (gl) {
        try {
          const ext = gl.getContext()?.getExtension("WEBGL_lose_context");
          if (ext) ext.loseContext();
        } catch {}
        try {
          // three.js WebGLRenderer provides forceContextLoss() in many builds
          // @ts-ignore
          if (typeof gl.forceContextLoss === "function") gl.forceContextLoss();
        } catch {}
        try {
          gl.dispose?.();
        } catch {}
      }
    };

    window.addEventListener("beforeunload", cleanup);
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

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

      <HierarchyPanel></HierarchyPanel>
      {selectedUUID.length > 0 && <Inspector />}
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
              shadows
              dpr={[1, 2]}
              gl={{
                preserveDrawingBuffer: false,
                powerPreference: "high-performance",
              }}
            >
              <OrthographicCamera
                makeDefault
                up={[0, 0, 1]}
                zoom={0.3}
                position={[0, 0, 30000]}
                near={0.01}
                far={100000}
                onUpdate={(camera) => camera.updateProjectionMatrix()}
              />
              <Scene fileUrlMap={fileUrlMap} />
            </Canvas>
          </Suspense>
        </Suspense>
        {/* <AnimationTimeline></AnimationTimeline> */}
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
