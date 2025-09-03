import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slider,
  Button,
  Typography,
} from "@mui/material";
import { useSceneStore } from "../../store";

export default function AnimationTimeline() {
  const animation = useSceneStore((state) => state.history.present.animation); // 'animations' -> 'animation'
  const { playAnimation, setAnimationTime, pauseAnimation } = useSceneStore();

  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );
  const selectedAnim =
    animation && selectedUUID && selectedUUID.length > 0
      ? animation[selectedUUID[0]]
      : null;

  return (
    <Drawer
      anchor="bottom"
      open={true} // 항상 열림 (필요에 따라 토글 가능)
      variant="persistent"
      sx={{ "& .MuiDrawer-paper": { height: "100px" } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Animation Timeline</Typography>
        {selectedAnim ? (
          <>
            <List>
              {selectedAnim.clips.map((clip, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => playAnimation(selectedUUID[0], index)}
                >
                  <ListItemText primary={clip.name || `Clip ${index}`} />
                </ListItem>
              ))}
            </List>
            <Slider
              value={selectedAnim.time}
              max={selectedAnim.clips[selectedAnim.currentClip]?.duration || 1}
              onChange={(e, value) =>
                setAnimationTime(selectedUUID[0], value as number)
              }
            />
            <Button
              onClick={() =>
                playAnimation(selectedUUID[0], selectedAnim.currentClip)
              }
            >
              Play
            </Button>
            <Button onClick={() => pauseAnimation(selectedUUID[0])}>
              Pause
            </Button>
          </>
        ) : (
          <Typography>No animation selected</Typography>
        )}
      </Box>
    </Drawer>
  );
}
