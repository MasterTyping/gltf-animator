import React, { useMemo } from "react";
import { useSceneStore } from "../../store";

import FolderIcon from "@mui/icons-material/Folder";
import CubeIcon from "@mui/icons-material/ViewInAr";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
  selected: boolean;
  onSelect: (uuid: string) => void;
  level?: number;
}

const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  object,
  selected,
  onSelect,
  level = 0,
}) => {
  const [open, setOpen] = React.useState(level === 0); // root open by default

  // Only show children that are in the store (filtered by uuid)
  const children = useMemo(
    () =>
      object.children.filter(
        (child) => child.type !== "Bone" && child.visible !== false
      ),
    [object.children]
  );

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: 2 + level * 2,
          bgcolor: selected ? "action.selected" : undefined,
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
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          ) : null
        }
      >
        <ListItemButton
          selected={selected}
          onClick={() => onSelect(object.uuid)}
        >
          <ListItemIcon>
            {object.type === "Scene" || object.type === "Group" ? (
              <FolderIcon fontSize="small" />
            ) : (
              <CubeIcon fontSize="small" />
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
                selected={selected && child.uuid === object.uuid}
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
  const selectedUUID = useSceneStore((s) => s.history.present.selectedUUID);
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
            <HierarchyNode
              object={root}
              selected={selectedUUID.includes(root.uuid)}
              onSelect={selectObject}
            />
          </List>
        </>
      )}
    </Drawer>
  );
};

export default HierarchyPanel;
