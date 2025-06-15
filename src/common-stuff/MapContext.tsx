import {createContext}   from "react";
import {MapController} from "../geo-stuff/controllers/MapController.tsx";

export const MapContext = createContext<MapController>(MapController.instance);
