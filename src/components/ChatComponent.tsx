import {forwardRef, use, useEffect, useImperativeHandle, useState} from "react";
import {defineCustomElements,} from "@esri/calcite-components/dist/loader";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common/MapContext.tsx";
import {MapModes} from "../modules/esri/utils/Constants.tsx";
import './MapComponent.css'
import {Geometry, Polygon, Polyline} from "@arcgis/core/geometry";
import {BlockSymbolUtils} from "../modules/esri/symbols/BlockSymbolUtils.tsx";
import Graphic from "@arcgis/core/Graphic";
import {StickSymbolUtils} from "../modules/esri/symbols/StickSymbolUtils.tsx";

defineCustomElements(window);

export interface ChatHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const ChatComponent = forwardRef<ChatHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrentMode: (mode: MapModes) => ctx.setMode(mode)
  }));

  // const gunBarrelRef = useRef<HTMLDivElement>(null);
  const ctx = use(MapContext);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    ctx.secondLayer.removeAll();

    const array: any[] = [];
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      array.push(...json);
    }
    else {
      array.push(json);
    }
    array.forEach(json => {
      if (json["type"] === "polygon") {
        const geometry = new Polygon(json);
        const symbol = BlockSymbolUtils.normal();
        ctx.secondLayer.add(new Graphic({
          geometry: geometry,
          symbol: symbol
        }))
      }
      if (json["type"] === "polyline") {
        const geometry = new Polyline(json);
        const symbol = StickSymbolUtils.normal();
        ctx.secondLayer.add(new Graphic({
          geometry: geometry,
          symbol: symbol
        }))
      }
    })
  };

  useEffect(() => {

  }, []);

  return (
    <>
      <button style={{position: "absolute"}} onClick={handleSubmit}>Send</button>
      <textarea style={{width: "100%", height: "100%"}} onChange={(e) => setText(e.target.value)}></textarea>
    </>
  );
});

export default ChatComponent;
