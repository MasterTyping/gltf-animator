import React from "react";
import { useSceneStore } from "../../store";
import * as THREE from "three";

// Simple right-side drawer styles
const drawerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  height: "100vh",
  width: 340,
  background: "rgba(30, 32, 36, 0.98)",
  color: "#fff",
  boxShadow: "-2px 0 16px rgba(0,0,0,0.18)",
  zIndex: 1000,
  padding: "32px 24px",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
  fontFamily: "Inter, Arial, sans-serif",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "#b3b8c3",
  fontSize: 13,
  marginBottom: 2,
};

const valueStyle: React.CSSProperties = {
  fontWeight: 400,
  color: "#fff",
  fontSize: 15,
  marginBottom: 16,
  wordBreak: "break-all",
};

export default function Inspector() {
  const selectedUUID = useSceneStore(
    (state) => state.history.present.selectedUUID
  );
  const objects = useSceneStore((state) => state.history.present.objects);

  // Only show inspector if something is selected
  if (!selectedUUID || selectedUUID.length === 0) {
    return (
      <div style={drawerStyle}>
        <div style={{ color: "#b3b8c3", fontSize: 16 }}>No object selected</div>
      </div>
    );
  }

  const object = objects[selectedUUID[0]] as THREE.Object3D | undefined;

  if (!object) {
    return (
      <div style={drawerStyle}>
        <div style={{ color: "#b3b8c3", fontSize: 16 }}>
          Selected object not found
        </div>
      </div>
    );
  }

  return (
    <aside style={drawerStyle}>
      <h2
        style={{
          margin: 0,
          marginBottom: 28,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.2,
        }}
      >
        Inspector
      </h2>
      <div>
        <div style={labelStyle}>Name</div>
        <div style={valueStyle}>{object.name || "(unnamed)"}</div>
      </div>
      <div>
        <div style={labelStyle}>UUID</div>
        <div style={valueStyle}>{object.uuid}</div>
      </div>
      <div>
        <div style={labelStyle}>Position</div>
        <div style={valueStyle}>
          {object.position.x.toFixed(2)}, {object.position.y.toFixed(2)},{" "}
          {object.position.z.toFixed(2)}
        </div>
      </div>
      <div>
        <div style={labelStyle}>Rotation</div>
        <div style={valueStyle}>
          {object.rotation.x.toFixed(2)}, {object.rotation.y.toFixed(2)},{" "}
          {object.rotation.z.toFixed(2)}
        </div>
      </div>
      <div>
        <div style={labelStyle}>Scale</div>
        <div style={valueStyle}>
          {object.scale.x.toFixed(2)}, {object.scale.y.toFixed(2)},{" "}
          {object.scale.z.toFixed(2)}
        </div>
      </div>
    </aside>
  );
}
