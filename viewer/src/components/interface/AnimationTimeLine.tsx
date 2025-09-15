import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { AnimationMixer, AnimationClip, Clock } from "three";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { useResourceLoader } from "../../hooks/useResourceLoader";

interface AnimationInfoProps {
  selectedObject: any; // selected object (e.g., loaded model)
}
interface AnimationData {
  name: string;
  duration: number;
  clip: AnimationClip;
}

const AnimationTimeline: React.FC<AnimationInfoProps> = ({
  selectedObject,
}) => {
  const animations = useMemo(() => {
    return useResourceLoader(selectedObject?.userData?.url).animations || [];
  }, [selectedObject]);
  const [animationInfo, setAnimationInfo] = useState<AnimationData[]>([]);
  const mixerRef = useRef<AnimationMixer | null>(null); // mixer ref
  const animationFrameIdRef = useRef<number>(0); // animationFrameId ref
  const clockRef = useRef<Clock>(new Clock());
  const [playing, setPlaying] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (selectedObject) {
      const mixer = new AnimationMixer(selectedObject);
      mixerRef.current = mixer;

      const animationData = animations.map((clip) => ({
        name: clip.name,
        duration: clip.duration,
        clip: clip,
      }));
      setAnimationInfo(animationData);
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [selectedObject, animations]);

  useEffect(() => {
    const animate = () => {
      if (mixerRef.current && playing) {
        const delta = clockRef.current.getDelta();
        mixerRef.current.update(delta);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [playing]);

  const handleAnimationSelect = (name: string) => {
    setSelectedAnimation(name);
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      const clip = animationInfo.find((anim) => anim.name === name)?.clip;
      if (clip) {
        const action = mixerRef.current.clipAction(clip);
        action.play();
      }
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  return (
    <div>
      <Typography variant="h6">Animations</Typography>
      <List>
        {animationInfo.map((animation) => (
          <ListItemButton
            key={animation.name}
            selected={selectedAnimation === animation.name}
            onClick={() => handleAnimationSelect(animation.name)}
          >
            <ListItemText primary={animation.name} />
          </ListItemButton>
        ))}
      </List>
      <button onClick={handlePlayPause}>
        {playing ? <StopIcon /> : <PlayArrowIcon />}
      </button>
    </div>
  );
};

export default AnimationTimeline;
