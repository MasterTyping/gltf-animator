import React, { useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { IK, IKChain, IKJoint } from "three-ik";

interface IKControllerProps {
  /** IK를 적용할 객체들의 부모가 되는 최상위 객체 */
  rootObject: THREE.Object3D;
  /** IK 체인을 구성할 객체들의 이름 배열. [끝 -> 시작] 순서로 제공해야 합니다. (예: ['Hand', 'ForeArm', 'UpperArm']) */
  chainObjectNames: string[];
}

/**
 * 일반적인 Object3D 계층 구조에 IK를 적용하고
 * 사용자가 조작할 수 있는 컨트롤러를 제공하는 컴포넌트입니다.
 */
export default function IKController({
  rootObject,
  chainObjectNames,
}: IKControllerProps) {
  const { scene } = useThree();
  const [ik, setIk] = useState<IK | null>(null);
  const [ikTarget, setIkTarget] = useState<THREE.Object3D | null>(null);

  // IK 초기화 로직
  useEffect(() => {
    if (!rootObject || !chainObjectNames || chainObjectNames.length < 2) {
      console.warn(
        "IKController: 'rootObject' and at least two 'chainObjectNames' are required."
      );
      return;
    }

    // 1. 체인을 구성할 Object3D들을 이름으로 찾습니다.
    const chainObjects: THREE.Object3D[] = [];
    for (const name of chainObjectNames) {
      const obj = rootObject.getObjectByName(name);
      if (obj) {
        chainObjects.push(obj);
      } else {
        console.warn(
          `IKController: Could not find an object named "${name}" in the hierarchy.`
        );
        return; // 하나라도 못 찾으면 IK 구성을 중단합니다.
      }
    }

    const newIk = new IK();
    const chain = new IKChain();

    // 2. IK 체인(Chain) 생성: 찾은 객체들로 관절(Joint)을 만듭니다.
    // chainObjectNames가 [끝, ..., 시작] 순서이므로, chainObjects도 같은 순서를 가집니다.
    for (const obj of chainObjects) {
      const joint = new IKJoint(obj, {});
      chain.add(joint);
    }

    // 3. IK 타겟(Target) 생성: 사용자가 기즈모로 움직일 제어점입니다.
    const endEffector = chainObjects[0]; // 배열의 첫 번째 요소가 체인의 끝입니다.
    const target = new THREE.Object3D();
    target.position.copy(endEffector.getWorldPosition(new THREE.Vector3()));
    scene.add(target);

    // 체인의 끝(endEffector)에 타겟을 연결합니다.
    (chain.joints[0].target as THREE.Object3D) = target;

    newIk.add(chain);
    setIk(newIk);
    setIkTarget(target);

    // 컴포넌트가 사라질 때 타겟을 씬에서 제거
    return () => {
      scene.remove(target);
      setIk(null);
      setIkTarget(null);
    };
  }, [rootObject, chainObjectNames, scene]); // 의존성 배열을 명확하게 합니다.

  // 매 프레임마다 IK 계산을 수행합니다.
  useFrame(() => {
    if (ik) {
      ik.update();
    }
  });

  if (!ikTarget) {
    return null;
  }

  return (
    // TransformControls를 IK 타겟에 붙여 사용자가 움직일 수 있게 합니다.
    <TransformControls object={ikTarget}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </TransformControls>
  );
}
