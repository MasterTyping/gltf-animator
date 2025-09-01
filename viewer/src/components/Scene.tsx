import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

/**
 * 3D 뷰어 씬을 구성하는 컴포넌트입니다.
 */
export default function Scene() {
  return (
    <>
      {/* 주변광: 모든 객체에 고르게 빛을 비춥니다. */}
      <ambientLight intensity={1.5} />
      {/* 방향광: 태양광처럼 특정 방향에서 오는 빛을 시뮬레이션합니다. */}
      <directionalLight position={[10, 10, 5]} intensity={2.5} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={1} />

      {/* 바닥에 그리드를 추가하여 공간감을 줍니다. */}
      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={5}
        sectionColor="#c8c8c8ff"
        fadeDistance={25}
      />

      {/* TODO: 여기에 GLTF 모델을 렌더링할 컴포넌트를 추가할 예정입니다. */}

      {/* OrbitControls: 마우스를 사용하여 씬을 회전, 확대/축소, 이동할 수 있게 해줍니다. */}
      <OrbitControls />
    </>
  );
}
