import {
  Camera,
  Object3D,
  Raycaster,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

export const getMousePosition = (
  event: MouseEvent,
  raycaster: Raycaster,
  camera: Camera,
  target: Object3D,
  gl: WebGLRenderer
): Vector3 | null => {
  const mouse = new Vector2();
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const rect = gl.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([target], true);

  if (intersects.length > 0) {
    return intersects[0].point as Vector3;
  }
  return null;
};
