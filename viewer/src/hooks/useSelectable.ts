import { useCallback, useState } from "react";
import { Raycaster, Object3D, Camera, Vector2, Scene } from "three";

type UseSelectableOptions = {
  camera: Camera;
  scene: Scene;
  domElement: HTMLElement;
};

export function useSelectable({
  camera,
  scene,
  domElement,
}: UseSelectableOptions) {
  const [selected, setSelected] = useState<Object3D | null>(null);

  const raycaster = new Raycaster();
  const mouse = new Vector2();

  const onClick = useCallback(
    (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        setSelected(intersects[0].object);
      } else {
        setSelected(null);
      }
    },
    [camera, scene, domElement]
  );

  // Attach event listener
  // You may want to handle cleanup in your component
  // Example: useEffect(() => { ... }, [])
  domElement.addEventListener("click", onClick);

  return { selected };
}
