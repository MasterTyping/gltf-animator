import { create } from "zustand";
import * as THREE from "three";
import { createAnimationActions } from "./action/animation";
import { produce } from "immer";

export interface KeyFrame {
  time: number; // 시간 (초)
  position: [number, number, number]; // 위치
  quaternion: [number, number, number, number]; // 회전 (쿼터니언)
  color?: string | number; // 선택적 색상
  scale?: [number, number, number]; // 선택적 크기
}

// 씬의 전체 상태를 나타내는 인터페이스입니다.
// 이제 씬에 있는 모든 객체와 현재 선택된 객체의 ID를 포함합니다.
export interface SceneState {
  objects: { [uuid: string]: THREE.Object3D }; // UUID를 키로 객체를 저장하여 검색 성능 향상
  selectedUUID: string[];
  root: THREE.Scene | null;
  animation?: {
    [uuid: string]: {
      clips: THREE.AnimationClip[];
      currentClip: number;
      isPlaying: boolean;
      time: number;
    };
  };
  currentTime: number;
  keyframes: Map<
    string,
    {
      [bone: string]: KeyFrame[];
    }
  >;
  // 향후 색상, 환경 설정 등 더 많은 상태를 추가할 수 있습니다.
}

// 히스토리 상태의 구조입니다. 이제 SceneState의 스냅샷을 저장합니다.
interface History {
  past: SceneState[];
  present: SceneState;
  future: SceneState[];
}

// 스토어의 전체 상태와 액션 타입을 정의합니다.
interface StoreState {
  history: History;
  // 액션: 씬의 상태를 변경하는 모든 동작들
  setScene: (gltfScene: THREE.Scene) => void;
  selectObject: (uuid: string[] | string | null) => void;
  updateObject: (
    uuid: string,
    position?: [number, number, number] | THREE.Vector3,
    rotation?: [number, number, number] | THREE.Euler,
    scale?: [number, number, number] | THREE.Vector3
  ) => void;
  // 애니메이션 관련 액션들
  // 히스토리 제어 액션
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// 히스토리의 초기 상태
const initialState: History = {
  past: [],
  present: {
    root: null,
    objects: {},
    selectedUUID: [],
    animation: {},
    currentTime: 0,
    keyframes: new Map(),
  },
  future: [],
};

/**
 * 씬의 모든 상태(객체 CRUD, 선택 등)를 관리하고
 * 모든 변경사항에 대한 Undo/Redo를 지원하는 Zustand 스토어입니다.
 */
export const useSceneStore = create<StoreState>((set, get) => ({
  history: initialState,

  setScene: (scene: THREE.Scene) => {
    set(
      produce((draft) => {
        console.log(
          "Setting new scene in store:",
          scene,
          draft.history.present
        );
        draft.history.past.push(draft.history.present);
        draft.history.future = [];
        draft.history.present.scene = scene;
        // 씬이 변경되면 모든 상태 초기화
        draft.history.present.selectedUUID = null;
        draft.history.present.animations = [];
        draft.history.present.mixer = null;
        draft.history.present.currentTime = 0;
        draft.history.present.keyframes = {};
        draft.history.present.objects = {};
        scene.traverse((obj) => {
          draft.history.present.objects[obj.uuid] = obj;
        });
      })
    );
  },

  selectObject: (uuid) => {
    if (!uuid || (Array.isArray(uuid) && uuid.length === 0)) {
      console.warn("Invalid UUID passed to selectObject:", uuid);
      return;
    }

    const currentUUID = get().history.present.selectedUUID;
    if (currentUUID === uuid) return;

    set(
      produce((draft) => {
        draft.history.present.selectedUUID = Array.isArray(uuid)
          ? uuid
          : [uuid];
      })
    );
  },

  updateObject: (uuid, position, rotation, scale) => {
    set(
      produce((draft) => {
        const obj = draft.history.present.objects[uuid];
        if (obj) {
          if (position) obj.position.set(...position);
          if (rotation) obj.rotation.set(...rotation);
          if (scale) obj.scale.set(...scale);
        }
      })
    );
  },
  // --- 히스토리 제어 액션들 ---

  undo: () => {
    set((state) => {
      const { past, present, future } = state.history;
      if (past.length === 0) return state;
      const previousState = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        history: {
          past: newPast,
          present: previousState,
          future: [present, ...future],
        },
      };
    });
  },

  redo: () => {
    set((state) => {
      const { past, present, future } = state.history;
      if (future.length === 0) return state;
      const nextState = future[0];
      const newFuture = future.slice(1);
      return {
        history: {
          past: [...past, present],
          present: nextState,
          future: newFuture,
        },
      };
    });
  },

  clear: () => set({ history: initialState }),
}));
