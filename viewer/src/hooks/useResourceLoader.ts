import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";

const loaders: { [key: string]: any } = {
  ".glb": GLTFLoader,
  ".gltf": GLTFLoader,
  ".obj": OBJLoader,
  ".stl": STLLoader,
  ".jpg": TextureLoader,
  ".jpeg": TextureLoader,
  ".png": TextureLoader,
  ".webp": TextureLoader,
};

export function useResourceLoader(url: string) {
  // blob URL 처리: 확장자를 fileUrl에서 추출
  let extension = "";
  let pureUrl = url;
  if (url.startsWith("blob:")) {
    const [blobPart, query] = url.split("?");
    pureUrl = blobPart; // 쿼리스트링 제거
    const nameMatch = url.match(/name=([^&]+)/);
    if (nameMatch) {
      const extMatch = nameMatch[1].match(/\.[^/.]+$/);
      extension = extMatch ? extMatch[0].toLowerCase() : "";
    }
  } else {
    const extensionMatch = url.match(/\.[^/.]+$/);
    extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";
  }

  const loader = loaders[extension];
  if (!loader) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${extension || pureUrl}`);
  }

  const data = useLoader(loader, pureUrl, (loader) => {
    // 필요시 loader 커스터마이즈
  });

  const { animations, scene, materials } = data;
  return { animations, model: scene, materials };
}
