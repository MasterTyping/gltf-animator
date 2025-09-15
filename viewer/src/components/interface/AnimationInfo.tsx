import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { AnimationMixer, AnimationClip, Object3D, Group } from "three";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { useResourceLoader } from "../../hooks/useResourceLoader";

interface AnimationInfoProps {
  selectedObject: Object3D | Group; // selected object (e.g., loaded model)
}
interface AnimationData {
  name: string;
  duration: number;
  clip: AnimationClip;
}

const AnimationInfo: React.FC<AnimationInfoProps> = ({ selectedObject }) => {
  const animations = useMemo(() => {
    return useResourceLoader(selectedObject?.userData?.url).animations || [];
  }, [selectedObject]);
  const [animationInfo, setAnimationInfo] = useState<AnimationData[]>([]);
  const mixerRef = useRef<AnimationMixer | null>(null); // mixer ref
  const animationFrameIdRef = useRef<number>(0); // animationFrameId ref

  useEffect(() => {
    if (selectedObject) {
      // mixer 초기화
      selectedObject.traverseAncestors((parent) => {
        if (parent.parent === null) {
          mixerRef.current = new AnimationMixer(parent);
        }
      });

      const animationData: AnimationData[] = animations.map(
        (clip: AnimationClip) => ({
          name: clip.name,
          duration: clip.duration,
          clip,
        })
      );
      console.log(animationData, selectedObject);
      setAnimationInfo(animationData);
    } else {
      setAnimationInfo([]);
    }

    // cleanup 함수
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [selectedObject, animations]);

  useEffect(() => {
    // 렌더링 루프
    let previousTime = 0;
    const tick = (currentTime: number) => {
      const deltaTime = (currentTime - previousTime) / 1000; // seconds
      previousTime = currentTime;
      if (mixerRef.current) {
        mixerRef.current.update(deltaTime);
      }
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };
    animationFrameIdRef.current = requestAnimationFrame(tick); // 렌더링 시작
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  return (
    <div>
      <Typography variant="h6">Animation Info</Typography>
      {selectedObject ? (
        <List>
          {animationInfo.map((a) => (
            <ListItemButton
              sx={{ userSelect: "none" }}
              key={a.name}
              onClick={() => {
                if (mixerRef.current) {
                  console.log(a.clip);
                  const action = mixerRef.current.clipAction(a.clip);
                  action.reset().play(); // 액션 초기화 및 재생
                  action.enabled = true; // 액션 활성화
                  console.log(mixerRef.current, a.clip);
                } else {
                  console.warn("Mixer is not initialized.");
                }
              }}
            >
              <ListItemText
                primary={`${a.name} - Duration: ${a.duration.toFixed(2)}s`}
              />
              {a.name ? <PlayArrowIcon /> : <StopIcon />}
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography variant="body2">No animations found.</Typography>
      )}
    </div>
  );
};

export default AnimationInfo;
