import React, { use, useEffect } from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";
import { useAnimations } from "@react-three/drei";
import { useSceneStore } from "../../store";
import { LoopOnce } from "three";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model, animations, materials } = useResourceLoader(url);
  const { ref, mixer, names, actions, clips } = useAnimations(
    animations,
    model
  );

  const { selectObject, setScene } = useSceneStore();

  const uuid = useSceneStore((state) => state.history.present.selectedUUID);
  if (!model) return null;

  useEffect(() => {
    if (model) {
      model.up.set(0, 0, 1); // 모델의 up 벡터를 Z축으로 설정
    }
  }, [model, animations, materials]);

  useEffect(() => {
    if (mixer && clips.length > 0) {
      let current = 0;
      let action = mixer.clipAction(clips[current]);
      action.play();
    }
  }, [model]);

  return (
    <primitive
      onClick={() => {
        selectObject(model.uuid);
      }}
      onDrag={() => {
        console.log("dragging model");
      }}
      onPointerOver={() => {}}
      onPointerOut={() => {}}
      onPointerDown={() => {}}
      object={model}
    />
  );
}
