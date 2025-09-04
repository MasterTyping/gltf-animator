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

  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );

  return (
    <Drawer
      anchor="bottom"
      open={selectedUUID.length > 0} // 항상 열림 (필요에 따라 토글 가능)
      variant="persistent"
      sx={{ "& .MuiDrawer-paper": { height: "100px" } }}
    ></Drawer>
  );
}
