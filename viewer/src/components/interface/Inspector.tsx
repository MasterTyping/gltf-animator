import React from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAnimations } from "@react-three/drei";

/**
 * 선택된 객체의 정보를 표시하는 UI 패널입니다.
 */
export default function InspectorPanel() {
  // Zustand 스토어에서 선택된 객체 상태를 가져옵니다.

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 300,
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
        backgroundColor: "rgba(40, 40, 40, 0.9)",
        color: "white",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box sx={{ padding: "16px" }}>
        <Typography variant="h6">Inspector</Typography>
        <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.2)" }} />
        {selectedUUID ? (
          <List dense>
            <ListItem>
              <ListItemText
                primary="Name"
                secondary={selectedUUID.name || "Unnamed"}
                secondaryTypographyProps={{ color: "inherit" }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Type"
                secondary={selectedUUID.type}
                secondaryTypographyProps={{ color: "inherit" }}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="UUID"
                secondary={selectedUUID.uuid}
                sx={{
                  "& .MuiListItemSecondary-root": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
                secondaryTypographyProps={{ color: "inherit" }}
              />
            </ListItem>
          </List>
        ) : (
          <Typography variant="body2" sx={{ color: "grey.400", mt: 1 }}>
            No object selected.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
