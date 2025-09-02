import React, { use, useEffect } from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";
import { useAnimations } from "@react-three/drei";
import { useSceneStore } from "../../store";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model, animations, materials } = useResourceLoader(url);
  const { ref, mixer, names, actions, clips } = useAnimations(
    animations,
    model
  );

  const { addObject, removeObject, updateObject, selectObject } =
    useSceneStore();

  const uuid = useSceneStore((state) => state.history.present.selectedUUID);
  if (!model) return null;

  useEffect(() => {
    if (model) {
      model.up.set(0, 0, 1); // 모델의 up 벡터를 Z축으로 설정
      console.log("Model loaded:", model);
      console.log("Animations:", animations);
      console.log("Materials:", materials);
      console.log(ref, mixer, names, actions, clips);
    }
  }, [model, animations, materials]);

  useEffect(() => {
    if (mixer && clips.length > 0) {
      clips.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }
  }, [clips]);

  return (
    <primitive
      onClick={() => {
        selectObject(model);
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
