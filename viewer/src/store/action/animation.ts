import * as THREE from "three";

// 애니메이션 액션 인터페이스
export interface AnimationActions {
  setAnimations: (uuid: string, clips: THREE.AnimationClip[]) => void;
  playAnimation: (uuid: string, clipIndex: number) => void;
  pauseAnimation: (uuid: string) => void;
  setAnimationTime: (uuid: string, time: number) => void;
}

// 애니메이션 액션 구현 (히스토리 업데이트 포함)
export const createAnimationActions = (
  set: any,
  get: any
): AnimationActions => ({
  setAnimations: (uuid: string, clips: THREE.AnimationClip[]) => {
    set((state: any) => ({
      history: {
        past: [...state.history.past, state.history.present],
        present: {
          ...state.history.present,
          animations: {
            ...state.history.present.animations,
            [uuid]: { clips, currentClip: 0, isPlaying: false, time: 0 },
          },
        },
        future: [],
      },
    }));
  },

  playAnimation: (uuid: string, clipIndex: number) => {
    set((state: any) => {
      const anim = state.history.present.animations[uuid];
      if (!anim) return state;
      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: {
            ...state.history.present,
            animations: {
              ...state.history.present.animations,
              [uuid]: { ...anim, currentClip: clipIndex, isPlaying: true },
            },
          },
          future: [],
        },
      };
    });
  },

  pauseAnimation: (uuid: string) => {
    set((state: any) => {
      const anim = state.history.present.animations[uuid];
      if (!anim) return state;
      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: {
            ...state.history.present,
            animations: {
              ...state.history.present.animations,
              [uuid]: { ...anim, isPlaying: false },
            },
          },
          future: [],
        },
      };
    });
  },

  setAnimationTime: (uuid: string, time: number) => {
    set((state: any) => {
      const anim = state.history.present.animations[uuid];
      if (!anim) return state;
      return {
        history: {
          past: [...state.history.past, state.history.present],
          present: {
            ...state.history.present,
            animations: {
              ...state.history.present.animations,
              [uuid]: { ...anim, time },
            },
          },
          future: [],
        },
      };
    });
  },
});
