import { create } from "zustand";
import * as THREE from "three";

// 씬의 전체 상태를 나타내는 인터페이스입니다.
// 이제 씬에 있는 모든 객체와 현재 선택된 객체의 ID를 포함합니다.
export interface SceneState {
  objects: { [uuid: string]: THREE.Object3D }; // UUID를 키로 객체를 저장하여 검색 성능 향상
  selectedUUID: string[];
  root?: THREE.Scene;
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
  addObject: (object: THREE.Object3D) => void;
  removeObject: (uuid: string[] | string) => void;
  updateObject: (
    uuid: string,
    newPosition: THREE.Vector3,
    newRotation: THREE.Euler,
    newScale: THREE.Vector3
  ) => void;
  selectObject: (uuid: string[] | string | null) => void;
  // 히스토리 제어 액션
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// 히스토리의 초기 상태
const initialState: History = {
  past: [],
  present: { objects: {}, selectedUUID: [] },
  future: [],
};

/**
 * 씬의 모든 상태(객체 CRUD, 선택 등)를 관리하고
 * 모든 변경사항에 대한 Undo/Redo를 지원하는 Zustand 스토어입니다.
 */
export const useSceneStore = create<StoreState>((set, get) => ({
  history: initialState,

  // --- 상태 변경 액션들 (새로운 히스토리 생성) ---

  // 새로운 GLTF/GLB 파일이 로드되었을 때 씬 전체를 설정합니다.
  setScene: (gltfScene) => {
    const newObjects: { [uuid: string]: THREE.Object3D } = {};
    gltfScene.traverse((child) => {
      // 복제하여 원본과의 참조를 끊습니다.
      newObjects[child.uuid] = child.clone();
    });

    set((state) => ({
      history: {
        past: [...state.history.past, state.history.present],
        present: { objects: newObjects, selectedUUID: [], root: gltfScene },
        future: [],
      },
    }));
  },

  addObject: (object) => {
    const newObject = object.clone(); // 안전을 위해 복제
    set((state) => {
      const newObjects = {
        ...state.history.present.objects,
        [newObject.uuid]: newObject,
      };
      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: { ...state.history.present, objects: newObjects },
          future: [],
        },
      };
    });
  },

  removeObject: (uuid) => {
    set((state) => {
      const newObjects = { ...state.history.present.objects };
      if (Array.isArray(uuid)) {
        uuid.forEach((id) => delete newObjects[id]);
      } else {
        delete newObjects[uuid];
      }
      const newSelectedUUID =
        state.history.present.selectedUUID[0] === uuid
          ? []
          : state.history.present.selectedUUID;

      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: {
            ...state.history.present,
            objects: newObjects,
            selectedUUID: newSelectedUUID,
          },
          future: [],
        },
      };
    });
  },

  // 예시: 위치, 회전, 크기 업데이트
  updateObject: (uuid, position, rotation, scale) => {
    set((state) => {
      const targetObject = state.history.present.objects[uuid];
      if (!targetObject) return state;

      const updatedObject = targetObject.clone();
      updatedObject.position.copy(position);
      updatedObject.rotation.copy(rotation);
      updatedObject.scale.copy(scale);

      const newObjects = {
        ...state.history.present.objects,
        [uuid]: updatedObject,
      };

      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: { ...state.history.present, objects: newObjects },
          future: [],
        },
      };
    });
  },

  selectObject: (uuid) => {
    set((state) => {
      // If uuid is null, clear selection
      if (uuid === null) {
        if (state.history.present.selectedUUID.length === 0) return state;
        return {
          history: {
            past: [...state.history.past, state.history.present],
            present: { ...state.history.present, selectedUUID: [] },
            future: [],
          },
        };
      }

      // If uuid is an array, set selection to that array
      if (Array.isArray(uuid)) {
        if (
          state.history.present.selectedUUID.length === uuid.length &&
          state.history.present.selectedUUID.every((id, i) => id === uuid[i])
        ) {
          return state;
        }
        return {
          history: {
            past: [...state.history.past, state.history.present],
            present: { ...state.history.present, selectedUUID: uuid },
            future: [],
          },
        };
      }

      // Otherwise, set selection to single uuid
      if (
        state.history.present.selectedUUID.length === 1 &&
        state.history.present.selectedUUID[0] === uuid
      ) {
        return state;
      }
      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: { ...state.history.present, selectedUUID: [uuid] },
          future: [],
        },
      };
    });
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
