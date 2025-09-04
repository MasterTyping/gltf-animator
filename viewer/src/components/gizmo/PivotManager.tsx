import React, { useEffect, useMemo, useRef } from "react";
import { PivotControls } from "@react-three/drei";
import { useSceneStore } from "../../store";
import { useThree, useFrame } from "@react-three/fiber";
import type { Group, Object3D } from "three";

/**
 * 선택된 객체에 PivotControls를 동적으로 붙여주는 관리자 컴포넌트입니다.
 */
export default function PivotManager() {
  const { scene } = useThree();
  const pivotRef = useRef<Group>(null);
  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );

  // 선택된 객체 찾기 (메모이제이션으로 안정화)
  const target = useMemo(() => {
    if (!scene || !selectedUUID || selectedUUID.length === 0) return null;
    const found = scene.getObjectsByProperty("uuid", selectedUUID[0])[0];
    return found as Object3D | null;
  }, [scene, selectedUUID]);

  // PivotControls의 transform을 객체와 동기화 (무한 루프 방지)
  useFrame(() => {
    if (pivotRef.current && target) {
      pivotRef.current.position.copy(target.position);
      pivotRef.current.rotation.copy(target.rotation);
      pivotRef.current.scale.copy(target.scale);
    }
  });

  // 드래그 종료 시 객체 업데이트 (스토어 연동)
  const handleDragEnd = () => {
    if (target && pivotRef.current) {
      target.position.copy(pivotRef.current.position);
      target.rotation.copy(pivotRef.current.rotation);
      target.scale.copy(pivotRef.current.scale);
      console.log("Object transform updated:", target.position);
      // 스토어 업데이트 (Undo/Redo 지원)
      useSceneStore
        .getState()
        .updateObject(
          target.uuid,
          target.position,
          target.rotation,
          target.scale
        );
    }
  };

  useEffect(() => {
    if (pivotRef.current) {
      pivotRef.current.name = "PivotGizmo";
      console.log("PivotControls attached to:", target?.name || "None");
    }
  }, [target]);

  // 선택된 객체가 있을 경우에만 PivotControls를 렌더링합니다.
  return target ? (
    <PivotControls
      ref={pivotRef}
      visible={true}
      onDragEnd={handleDragEnd}
      depthTest={false}
      lineWidth={5}
      anchor={[0, 0, 0]}
      scale={200}
    />
  ) : null;
}
