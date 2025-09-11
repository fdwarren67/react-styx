import {forwardRef, use, useEffect, useImperativeHandle} from "react";
import {defineCustomElements,} from "@esri/calcite-components/dist/loader";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common/MapContext.tsx";
import {MapModes} from "../modules/esri/utils/Constants.tsx";
import './MapComponent.css'

defineCustomElements(window);

export interface GunBarrelHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const GunBarrelComponent = forwardRef<GunBarrelHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrentMode: (mode: MapModes) => ctx.setMode(mode)
  }));

  // const gunBarrelRef = useRef<HTMLDivElement>(null);
  const ctx = use(MapContext);

  useEffect(() => {

  }, []);

  return (
    <svg
      style={{height: '100%', width: '100%'}}
      // onMouseMove={(e) => currentTool.pointerMove(e)}
      // onMouseUp={(e) => currentTool.pointerUp(e)}
      // height={boxHeight}
      // width={boxWidth}
    >
      {/*{horizontalLines.map((h, index) => (*/}
      {/*  <line*/}
      {/*    key={`h-${index}`}*/}
      {/*    x1={0}*/}
      {/*    y1={h.y}*/}
      {/*    x2={boxWidth}*/}
      {/*    y2={h.y}*/}
      {/*    stroke="black"*/}
      {/*    strokeWidth={1}*/}
      {/*    strokeOpacity={h.opacity}*/}
      {/*  />*/}
      {/*))}*/}

      {/*{verticalLines.map((v, index) => (*/}
      {/*  <line*/}
      {/*    key={`v-${index}`}*/}
      {/*    x1={v.x}*/}
      {/*    y1={0}*/}
      {/*    x2={v.x}*/}
      {/*    y2={boxHeight}*/}
      {/*    stroke="black"*/}
      {/*    strokeWidth={1}*/}
      {/*    strokeOpacity={v.opacity}*/}
      {/*  />*/}
      {/*))}*/}

      {/*{markers.map((m, index) => (*/}
      {/*  <line*/}
      {/*    key={`m-${index}`}*/}
      {/*    x1={m.x}*/}
      {/*    y1={m.y1}*/}
      {/*    x2={m.x}*/}
      {/*    y2={m.y2}*/}
      {/*    stroke={m.color}*/}
      {/*    strokeWidth={1}*/}
      {/*    strokeOpacity={1}*/}
      {/*  />*/}
      {/*))}*/}

      {/*{labels.map((label, index) => (*/}
      {/*  <text*/}
      {/*    key={`label-${index}`}*/}
      {/*    x={label.x}*/}
      {/*    y={label.y}*/}
      {/*    fill={label.color}*/}
      {/*    style={{textAnchor: 'middle'}}*/}
      {/*  >*/}
      {/*    {label.text}*/}
      {/*  </text>*/}
      {/*))}*/}

      {/*{fieldRuleBuffers.map((b, index) => (*/}
      {/*  <rect*/}
      {/*    key={`buf-${index}`}*/}
      {/*    x={b.x}*/}
      {/*    y={b.y}*/}
      {/*    width={b.width}*/}
      {/*    height={b.height}*/}
      {/*    className="field-rule-buffer"*/}
      {/*  />*/}
      {/*))}*/}

      {/*{horizontalLabels.map((hlabel, index) => (*/}
      {/*  <text key={`hlab-${index}`} className="horizontalLabel" x={5} y={hlabel.y}>*/}
      {/*    {hlabel.label}*/}
      {/*  </text>*/}
      {/*))}*/}

      {/*{stickPoints.map((pt, index) => (*/}
      {/*  <circle*/}
      {/*    key={`stick-${index}`}*/}
      {/*    cx={pt.x}*/}
      {/*    cy={pt.y}*/}
      {/*    r={9}*/}
      {/*    stroke={pt.strokeColor}*/}
      {/*    strokeWidth={4}*/}
      {/*    fill={pt.color}*/}
      {/*    onMouseDown={(e) => currentTool.pointerDown(e, pt.stickGuid)}*/}
      {/*  />*/}
      {/*))}*/}

      {/*{ihsPoints.map((pt, index) => (*/}
      {/*  <circle*/}
      {/*    key={`ihs-${index}`}*/}
      {/*    cx={pt.x}*/}
      {/*    cy={pt.y}*/}
      {/*    r={6}*/}
      {/*    stroke={pt.strokeColor}*/}
      {/*    strokeWidth={2}*/}
      {/*    fill={pt.color}*/}
      {/*  />*/}
      {/*))}*/}

      {/*{awlPoints.map((pt, index) => (*/}
      {/*  <circle*/}
      {/*    key={`awl-${index}`}*/}
      {/*    cx={pt.x}*/}
      {/*    cy={pt.y}*/}
      {/*    r={3}*/}
      {/*    stroke={pt.strokeColor}*/}
      {/*    strokeWidth={2}*/}
      {/*    fill={pt.color}*/}
      {/*  />*/}
      {/*))}*/}
    </svg>
  );
});

export default GunBarrelComponent;
