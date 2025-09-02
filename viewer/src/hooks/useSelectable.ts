import { useThree } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { Raycaster, Object3D, Camera, Vector2, Scene } from "three";

type UseSelectableOptions = {
  camera: Camera;
  scene: Scene;
  domElement: HTMLElement;
};

export function useSelectable() {}
