import { OrbitControls, Grid } from "@react-three/drei";
import Model from "../components/objects/Model";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useSceneStore } from "../store";
import * as THREE from "three";

interface SceneProps {
  fileUrlMap: Map<string, string>;
  name?: string;
}
/**
 * 3D 뷰어 씬을 구성하는 컴포넌트입니다.
 */
export default function Scene({ fileUrlMap, name = "root" }: SceneProps) {
  // setScene(model.parent); // 또는 필요한 정보만 저장

  const { scene, camera, gl } = useThree();
  const setScene = useSceneStore((state) => state.setScene);

  useEffect(() => {
    if (scene) {
      console.log(scene);
      setScene(scene);
    }
  }, [scene]);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} />

      {fileUrlMap.size &&
        [...fileUrlMap.entries()].map(([id, url]) => (
          <Model key={id} url={url} />
        ))}

      <OrbitControls
        camera={camera}
        makeDefault={true}
        minZoom={0.03}
        enableDamping={false}
        domElement={gl.domElement}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  );
}
