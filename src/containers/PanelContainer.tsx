import {Rnd} from "react-rnd";
import React, {forwardRef, useImperativeHandle, useState} from "react";

type PanelProps = {
  children: React.ReactNode;
  panelCode: string;
  title: string;
  defaults: {
    position: {
      x: number;
      y: number;
    };
    size: {
      width: string;
      height: string;
    }
  },
  onBringToFront: () => void,
  onSetToBackPanel: () => void,
  onResize: (size: {height: string, width: string}) => void,
};

export interface PanelHandle {
  setBackPanelCode: (code: string) => void;
  setZOrder: (panelOrder: string[]) => void;
  hide: () => void;
}

const PanelContainer = forwardRef<PanelHandle, PanelProps>(({ children, panelCode, title, defaults, onBringToFront, onSetToBackPanel, onResize }, ref)=> {
  const [position, setPosition] = useState(defaults.position);
  const [size, setSize] = useState(defaults.size);
  const [zIndex, setZIndex] = useState(0);
  const [isFloating, setIsFloating] = useState(true);

  useImperativeHandle(ref, () => ({
    setBackPanelCode(code: string): void {
      if (code === panelCode && isFloating) {
        setToBackPanel();
      }
      else if (code !== panelCode && !isFloating) {
        setToFloatingPanel();
      }
    },
    setZOrder(panelOrder: string[]): void {
      if (isFloating) {
        setZIndex(panelOrder.indexOf(panelCode));
      }
    },
    hide(): void {
      if (isFloating) {
        hide();
      }
    }
  }));

  const setToFloatingPanel = () => {
    setIsFloating(true);
    setPosition(defaults.position);
    setSize(defaults.size);
    setZIndex(0);
  }

  const setToBackPanel = () => {
    if (isFloating) {
      setIsFloating(false);
      setPosition({ x: 0, y: 0 });
      setSize({ width: "100vw", height: "100vh" });
      setZIndex(-100);
      onSetToBackPanel();
    }
  }

  const hide = () => {
    setZIndex(-1000);
  }

  return (
    <Rnd size={size} position={position} dragHandleClassName="custom-drag-handle" style={{border: "1px solid #555", background: "#f9f9f9", zIndex: zIndex}}
         onDragStop={(e, d) => {
           setPosition({ x: d.x, y: d.y });
         }}
         onResize={(e, direction, ref, delta, position) => {
           const size = {
             width: ref.style.width,
             height: ref.style.height
           };

           setSize(size);
           setPosition(position);
           onResize(size);
         }}>
      <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
        <div className="custom-drag-handle bg-primary text-white p-2 d-flex align-items-center" style={{cursor: "move", height: "40px", overflow: "hidden", flexShrink: "0"}}>
          {title}
          <div className={"ms-auto d-flex align-items-center"} style={{padding: "0px 0px"}}>
            <i className={"bi bi-x fs-2 me-1"} style={{cursor: "pointer", fontSize: "2rem", lineHeight: 1}}
               onClick={() => hide()}></i>
            <i className={"bi bi-chevron-bar-up fs-3 me-2"} style={{cursor: "pointer", fontSize: "2rem", lineHeight: 1}}
               onClick={() => onBringToFront()}></i>
            <i className={"bi bi-arrows-fullscreen"} style={{cursor: "pointer"}}
               onClick={() => setToBackPanel()}></i>
          </div>
        </div>
        <div className="flex-grow-1" style={{overflow: "hidden", display: "flex", flexDirection: "column"}}>
          {children}
        </div>
      </div>
    </Rnd>
  );
});

export default PanelContainer;
