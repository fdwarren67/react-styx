import {createContext}   from "react";
import {MapController} from "../modules/esri/controllers/MapController.tsx";

export const MapContext = createContext<MapController>(MapController.instance);
