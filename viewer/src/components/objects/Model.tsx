import React, { useEffect, useRef, useMemo } from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";
import { PivotControls, useAnimations } from "@react-three/drei";
import { useSceneStore } from "../../store";
import { Group, LoopOnce, Object3D, Mesh, LoopRepeat } from "three";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model, animations, materials } = useResourceLoader(url);
  const rootRef = useRef<Group>(null);
  const { ref, mixer, names, actions, clips } = useAnimations(
    animations,
    model
  );

  const { selectObject } = useSceneStore();
  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );

  // 메모이제이션으로 불필요한 리렌더링 방지
  const memoizedModel = useMemo(() => model, [model?.uuid]); // 모델 UUID로 메모이제이션

  useEffect(() => {
    if (memoizedModel && animations) {
      memoizedModel.animations = animations; // 메모이제이션된 모델에만 적용
    }
  }, [memoizedModel, animations]);

  // useEffect(() => {
  //   if (mixer && clips.length > 0) {
  //     const current = 0;
  //     const action = mixer.clipAction(clips[current]);
  //     // action.setLoop(LoopRepeat, 1); // 루프 제한으로 성능 최적화
  //     action.play();
  //   }
  // }, [mixer, clips]); // 의존성 최소화

  // 메모리 해제 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      if (mixer) {
        mixer.stopAllAction(); // 애니메이션 정지
      }
      if (memoizedModel) {
        memoizedModel.traverse((child: Object3D) => {
          if (child instanceof Mesh) {
            child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [memoizedModel, mixer]);

  if (!memoizedModel) return null;

  return (
    <>
      <primitive
        ref={rootRef}
        onClick={() => {
          selectObject(memoizedModel.uuid);
        }}
        onPointerOver={() => {}} // 불필요한 이벤트 제거
        onPointerOut={() => {}}
        onPointerDown={() => {}}
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
