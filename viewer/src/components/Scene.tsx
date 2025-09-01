import { OrbitControls, Grid } from "@react-three/drei";
import Model from "../components/objects/Model";

interface SceneProps {
  fileUrlMap: Map<string, string>;
}
/**
 * 3D 뷰어 씬을 구성하는 컴포넌트입니다.
 */
export default function Scene({ fileUrlMap }: SceneProps) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.5} />
      <directionalLight position={[-10, -10, -5]} intensity={1} />

      {fileUrlMap.size &&
        [...fileUrlMap.entries()].map(([id, url]) => (
          <Model key={id} url={url} />
        ))}

      <OrbitControls />
    </>
  );
}
