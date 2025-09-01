import React from "react";
import { useResourceLoader } from "../../hooks/useResourceLoader";

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const { model } = useResourceLoader(url);
  if (!model) return null;
  return <primitive object={model} />;
}
