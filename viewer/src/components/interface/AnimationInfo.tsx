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
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null); // 현재 재생 중인 애니메이션 이름

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

  const playAnimation = (clip: AnimationClip) => {
    if (mixerRef.current) {
      const action = mixerRef.current.clipAction(clip);
      action.reset().play();
      setActiveAnimation(clip.name);

      const animate = () => {
        mixerRef.current?.update(0.016); // 약 60fps 기준
        animationFrameIdRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  };

  const stopAnimation = () => {
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      cancelAnimationFrame(animationFrameIdRef.current);
      setActiveAnimation(null);
    }
  };

  return (
    <div>
      <Typography variant="h6">Animation Info</Typography>
      {selectedObject ? (
        <List
          dense
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none", // 웹킷 기반 브라우저에서 스크롤바 숨기기
            },
          }}
        >
          {animationInfo.map((a) => (
            <ListItemButton
              sx={{ userSelect: "none" }}
              key={a.name}
              onClick={() =>
                activeAnimation === a.name
                  ? stopAnimation()
                  : playAnimation(a.clip)
              }
            >
              <ListItemText
                primary={`${a.name} - Duration: ${a.duration.toFixed(2)}s`}
              />
              {activeAnimation === a.name ? <StopIcon /> : <PlayArrowIcon />}
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
