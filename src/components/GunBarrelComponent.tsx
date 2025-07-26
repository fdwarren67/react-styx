import {forwardRef, use, useEffect, useImperativeHandle} from "react";
import {defineCustomElements,} from "@esri/calcite-components/dist/loader";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common-stuff/MapContext.tsx";
import {MapModes} from "../geo-stuff/utils/Constants.tsx";
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
    <svg style={{height: "100%", width: "100%"}}>
  {/*       onMouseMove={}*/}
  {/*      (mousemove)="currentTool.pointerMove($event)" (mouseup)="currentTool.pointerUp($event)" [style.height]="boxHeight"*/}
  {/*    [style.width]="boxWidth">*/}
  {/*    <line *ngFor="let h of horizontalLines" [attr.x1]="0" [attr.y1]="h.y" [attr.x2]="boxWidth" [attr.y2]="h.y" stroke="black"*/}
  {/*    stroke-width="1" [attr.stroke-opacity]="h.opacity"/>*/}
  {/*    <line *ngFor="let v of verticalLines" [attr.x1]="v.x" [attr.y1]="0" [attr.x2]="v.x" [attr.y2]="boxHeight" stroke="black"*/}
  {/*    stroke-width="1" [attr.stroke-opacity]="v.opacity"/>*/}

  {/*    <line *ngFor="let m of markers" [attr.x1]="m.x" [attr.y1]="m.y1" [attr.x2]="m.x" [attr.y2]="m.y2" [attr.stroke]="m.color"*/}
  {/*    stroke-width="1" stroke-opacity="1"/>*/}

  {/*    <text *ngFor="let label of labels" [attr.x]="label.x" [attr.y]="label.y" [style.fill]="label.color" style="text-anchor: middle">*/}
  {/*    {{ label.text }}*/}
  {/*  </text>*/}

  {/*<rect *ngFor="let b of fieldRuleBuffers" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.width" [attr.height]="b.height"*/}
  {/*class="field-rule-buffer"/>*/}
  {/*<text *ngFor="let hlabel of horizontalLabels" class="horizontalLabel" x="5" [attr.y]="hlabel.y">{{ hlabel.label }}</text>*/}
  {/*<circle *ngFor="let pt of stickPoints"*/}
  {/*  [attr.cx]="pt.x" [attr.cy]="pt.y" r="9"*/}
  {/*  [attr.stroke]="pt.strokeColor" stroke-width="4" [attr.fill]="pt.color"*/}
  {/*(mousedown)="currentTool.pointerDown($event, pt.stickGuid)"/>*/}
  {/*<circle *ngFor="let pt of ihsPoints"*/}
  {/*  [attr.cx]="pt.x" [attr.cy]="pt.y" r="6"*/}
  {/*  [attr.stroke]="pt.strokeColor" stroke-width="2" [attr.fill]="pt.color"/>*/}
  {/*<circle *ngFor="let pt of awlPoints"*/}
  {/*  [attr.cx]="pt.x" [attr.cy]="pt.y" r="3"*/}
  {/*  [attr.stroke]="pt.strokeColor" stroke-width="2" [attr.fill]="pt.color"/>*/}
    </svg>
  );
});

export default GunBarrelComponent;
