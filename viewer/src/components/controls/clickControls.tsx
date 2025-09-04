import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";

interface ClickControlsProps {
  // If true, preventDefault() on pointer events
  preventDefault?: boolean;
  // max movement (px) before considering pointer action a drag instead of click
  moveThreshold?: number;
  // max time (ms) between down and up to be considered a click
  timeThreshold?: number;
}

export const useClickControls = () => {};

export default function ClickControls({
  preventDefault = true,
  moveThreshold = 6,
  timeThreshold = 500,
}: ClickControlsProps) {
  const { gl, scene } = useThree();
  const pointerState = useRef<{
    id: number | null;
    startX: number;
    startY: number;
    startTime: number;
    moved: boolean;
    downTarget: EventTarget | null;
  }>({
    id: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    moved: false,
    downTarget: null,
  });

  useEffect(() => {
    const webglCanvas = gl.domElement;
    if (!webglCanvas) return;

    const onPointerDown = (e: PointerEvent) => {
      if (preventDefault) e.preventDefault();
      pointerState.current.id = e.pointerId;
      pointerState.current.startX = e.clientX;
      pointerState.current.startY = e.clientY;
      pointerState.current.startTime = performance.now();
      pointerState.current.moved = false;
      pointerState.current.downTarget = e.target;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerState.current.id !== e.pointerId) return;
      const dx = e.clientX - pointerState.current.startX;
      const dy = e.clientY - pointerState.current.startY;
      if (!pointerState.current.moved && Math.hypot(dx, dy) > moveThreshold) {
        pointerState.current.moved = true;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerState.current.id !== e.pointerId) return;
      const dt = performance.now() - pointerState.current.startTime;
      const targetUnchanged = pointerState.current.downTarget === e.target;
      const isClick =
        !pointerState.current.moved && dt <= timeThreshold && targetUnchanged;

      if (preventDefault) e.preventDefault();

      if (isClick && onClick) onClick(e);
      // reset
      pointerState.current.id = null;
      pointerState.current.moved = false;
      pointerState.current.downTarget = null;
    };

    const onDblClick = (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();
      if (onDoubleClick) onDoubleClick(e);
    };

    const onCtx = (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();
      if (onContextMenu) onContextMenu(e);
    };

    webglCanvas.addEventListener("pointerdown", onPointerDown);
    webglCanvas.addEventListener("pointermove", onPointerMove);
    webglCanvas.addEventListener("pointerup", onPointerUp);
    webglCanvas.addEventListener("dblclick", onDblClick);
    webglCanvas.addEventListener("contextmenu", onCtx);

    return () => {
      webglCanvas.removeEventListener("pointerdown", onPointerDown);
      webglCanvas.removeEventListener("pointermove", onPointerMove);
      webglCanvas.removeEventListener("pointerup", onPointerUp);
      webglCanvas.removeEventListener("dblclick", onDblClick);
      webglCanvas.removeEventListener("contextmenu", onCtx);
    };
  }, [
    onClick,
    onDoubleClick,
    onContextMenu,
    preventDefault,
    moveThreshold,
    timeThreshold,
  ]);

  return null;
}
