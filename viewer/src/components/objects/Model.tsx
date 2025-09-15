import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";
import { PivotControls, useAnimations } from "@react-three/drei";
import { useSceneStore } from "../../store";
import { Group, LoopOnce, Object3D, Mesh, LoopRepeat } from "three";
import { useThree } from "@react-three/fiber";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model, animations, materials } = useResourceLoader(url);
  const { scene } = useThree();
  const rootRef = useRef<Group>(null);
  const { ref, mixer, names, actions, clips } = useAnimations(
    animations,
    model
  );

  const { selectObject } = useSceneStore();
  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );

  useCallback(() => {}, [selectedUUID, model]);

  // 메모이제이션으로 불필요한 리렌더링 방지
  const memoizedModel = useMemo(() => model, [model?.uuid]); // 모델 UUID로 메모이제이션

  if (!memoizedModel) return null;

  return (
    <>
      <primitive
        onClick={(e) => {
          console.log("Model clicked:", memoizedModel.name, scene);
          e.stopPropagation();
          selectObject(memoizedModel.uuid);
        }}
        ref={rootRef}
        object={memoizedModel}
      >
        <PivotControls
          visible={true}
          depthTest={false} // 다른 객체에 가려져도 보이도록 설정
          lineWidth={2}
          anchor={[0, 0, 0]}
          scale={200}
        />
      </primitive>
    </>
  );
}
