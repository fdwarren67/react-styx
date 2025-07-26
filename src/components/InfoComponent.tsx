import {forwardRef, use, useEffect, useImperativeHandle} from "react";
import {defineCustomElements,} from "@esri/calcite-components/dist/loader";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common-stuff/MapContext.tsx";
import {MapModes} from "../geo-stuff/utils/Constants.tsx";
import './MapComponent.css'

defineCustomElements(window);

export interface InfoHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const GunBarrelComponent = forwardRef<InfoHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrentMode: (mode: MapModes) => ctx.setMode(mode)
  }));

  // const gunBarrelRef = useRef<HTMLDivElement>(null);
  const ctx = use(MapContext);

  useEffect(() => {

  }, []);

  return (
    <svg style={{height: "100%", width: "100%"}}>

    </svg>
  );
});

export default GunBarrelComponent;
