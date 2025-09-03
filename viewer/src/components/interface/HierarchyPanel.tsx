import React, { useMemo } from "react";
import { useSceneStore } from "../../store";

import FolderIcon from "@mui/icons-material/Folder";
import CubeIcon from "@mui/icons-material/ViewInAr";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HighlightIcon from "@mui/icons-material/Highlight";
import VideocamIcon from "@mui/icons-material/Videocam";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { Object3D, Scene } from "three";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  Typography,
} from "@mui/material";

interface HierarchyNodeProps {
  object: Object3D;
  onSelect: (uuid: string) => void;
  level?: number;
}

const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  object,
  onSelect,
  level = 0,
}) => {
  const [open, setOpen] = React.useState(level === 0); // root open by default

  // selectedUUID을 스토어에서 직접 읽어서 각 노드가 스스로 선택 여부 판단
  const selectedUUID = useSceneStore((s) => s.history.present.selectedUUID);
  const isSelected = Array.isArray(selectedUUID)
    ? selectedUUID.includes(object.uuid)
    : selectedUUID === object.uuid;

  // children을 직접 계산 (useMemo 제거 -> three.js가 children 배열을 내부적으로 변경해도 항상 최신 상태 사용)
  const children = object.children.filter(
    (child) => child.type !== "Bone" && child.visible !== false
  );

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: 2 + level * 2,
          bgcolor: isSelected ? "action.selected" : undefined,
        }}
        secondaryAction={
          children.length > 0 ? (
            <ListItemButton
              sx={{ minWidth: 32 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((prev) => !prev);
              }}
            >
              {open ? <ExpandMore /> : <NavigateBeforeIcon />}
            </ListItemButton>
          ) : null
        }
      >
        <ListItemButton
          selected={isSelected}
          onClick={() => onSelect(object.uuid)}
        >
          <ListItemIcon>
            {object.type === "Scene" || object.type === "Group" ? (
              <FolderIcon fontSize="small" />
            ) : object.type === "Object3D" ||
              object.type === "Mesh" ||
              object.type.includes("Geometry") ? (
              <CubeIcon fontSize="small" />
            ) : object.type.includes("Light") ? (
              <HighlightIcon fontSize="small" />
            ) : object.type.includes("Camera") ? (
              <VideocamIcon fontSize="small" />
            ) : object.type.includes("Material") ? (
              <ColorLensIcon fontSize="small" />
            ) : (
              <QuestionMarkIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={object.name || object.type}
            secondary={object.type !== "Mesh" ? undefined : object.type}
            sx={{ ml: 1 }}
          />
        </ListItemButton>
      </ListItem>
      {children.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {children.map((child) => (
              <HierarchyNode
                key={child.uuid}
                object={child}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export const HierarchyPanel: React.FC = () => {
  const root = useSceneStore((s) => s.history.present.root);
  const selectObject = useSceneStore((s) => s.selectObject);

  return (
    <Drawer
      anchor="left"
      open={!!root}
      variant="persistent"
      PaperProps={{ sx: { width: 320, maxWidth: "100vw", p: 1 } }}
    >
      {!root ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            No scene loaded
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Hierarchy
          </Typography>
          <List dense disablePadding>
            <HierarchyNode object={root} onSelect={selectObject} />
          </List>
        </>
      )}
    </Drawer>
  );
};

export default HierarchyPanel;
