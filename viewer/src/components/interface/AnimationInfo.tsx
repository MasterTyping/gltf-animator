import { Typography, List, ListItemText, ListItemButton } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { AnimationMixer, AnimationClip } from "three";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

interface AnimationInfoProps {
  selectedObject: any; // selected object (e.g., loaded model)
}
interface AnimationData {
  name: string;
  duration: number;
  clip: AnimationClip;
}

const AnimationInfo: React.FC<AnimationInfoProps> = ({ selectedObject }) => {
  const [animationInfo, setAnimationInfo] = useState<AnimationData[]>([]);

  // Ensure mixer is explicitly null when not available.
  // Note: mixer.update(delta) must be called from your render loop (e.g., useFrame inside the Canvas)
  const mixer = useMemo<AnimationMixer | null>(() => {
    if (selectedObject && selectedObject.animations) {
      return new AnimationMixer(selectedObject);
    }
    return null;
  }, [selectedObject]);

  useEffect(() => {
    if (selectedObject && selectedObject.animations) {
      const animations = selectedObject.animations as AnimationClip[];
      const animationData: AnimationData[] = animations.map((clip) => ({
        name: clip.name,
        duration: clip.duration,
        clip,
      }));
      setAnimationInfo(animationData);
    } else {
      setAnimationInfo([]);
    }
  }, [selectedObject]);

  return (
    <div>
      <Typography variant="h6">Animation Info</Typography>
      {selectedObject?.animations?.length > 0 ? (
        <List>
          {animationInfo.map((a) => (
            <ListItemButton
              sx={{ userSelect: "none" }}
              key={a.name}
              onClick={() => {
                if (mixer) {
                  mixer.clipAction(a.clip).play();
                  console.log(mixer, a.clip);
                } else {
                  console.warn("Mixer is not initialized.");
                }
              }}
            >
              <ListItemText
                primary={`${a.name} - Duration: ${a.duration.toFixed(2)}s`}
              />
              <PlayArrowIcon />
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
