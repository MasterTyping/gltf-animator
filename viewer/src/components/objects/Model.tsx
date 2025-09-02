import React, { use, useEffect } from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model, animations, materials } = useResourceLoader(url);
  if (!model) return null;

  useEffect(() => {
    if (model) {
      console.log("Model loaded:", model);
      console.log("Animations:", animations);
      console.log("Materials:", materials);
    }
  }, [model, animations, materials]);

  return <primitive object={model} />;
}
