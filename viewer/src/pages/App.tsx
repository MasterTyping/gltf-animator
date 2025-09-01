import React, { Suspense } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import { Canvas } from "@react-three/fiber";
import Scene from "../components/Scene";

/**
 * 애플리케이션의 메인 페이지 컴포넌트입니다.
 * UI 레이아웃과 3D 캔버스를 포함합니다.
 */
export default function HomePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            ✨ GLTF Animator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 3D 뷰어가 렌더링될 메인 영역 */}
      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                color: "white",
              }}
            >
              <CircularProgress color="inherit" />
              <Typography sx={{ ml: 2 }}>Loading 3D Scene...</Typography>
            </Box>
          }
        >
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            shadows /* 씬에 그림자를 활성화합니다. */
          >
            <color attach="background" args={["#1c1c1c"]} />
            <Scene />
          </Canvas>
        </Suspense>
      </Box>
    </Box>
  );
}
