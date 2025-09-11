import {forwardRef, use, useEffect, useImperativeHandle, useRef} from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import {SpatialReference} from "@arcgis/core/geometry";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {defineCustomElements,} from "@esri/calcite-components/dist/loader";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common/MapContext.tsx";
import {GeoTest} from "../modules/esri/controllers/GeoTest.tsx";
import {MapModes} from "../modules/esri/utils/Constants.tsx";
import './MapComponent.css'
import ViewClickEvent = __esri.ViewClickEvent;
import ViewPointerMoveEvent = __esri.ViewPointerMoveEvent;
import ViewDoubleClickEvent = __esri.ViewDoubleClickEvent;
import ViewDragEvent = __esri.ViewDragEvent;

defineCustomElements(window);

export interface MapHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const MapComponent = forwardRef<MapHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrentMode: (mode: MapModes) => ctx.setMode(mode)
  }));

  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<__esri.MapView | null>(null);
  const ctx = use(MapContext);
  // const [statePlaneLocation, setStatePlaneLocation] = useState<string>('');
  // const [wgs84Location, setWgs84Location] = useState<string>('');

  const calcPointerLocation = (event: ViewPointerMoveEvent): void => {
    // if (!ctx.view) {
    //   setStatePlaneLocation('');
    //   setWgs84Location('');
    //   return;
    // }
    //
    // const pointStatePlane = projectOperator.execute(ctx.view.toMap(event), ctx.statePlane!) as Point;
    // setStatePlaneLocation(`X/Y: ${Math.round(pointStatePlane.x)} / ${Math.round(pointStatePlane.y)}`);
    //
    // const pointWgs84 = projectOperator.execute(ctx.view.toMap(event), SpatialReference.WGS84) as Point;
    // setWgs84Location(`WGS84: ${Math.round(pointWgs84.x * 1000000) / 1000000}, ${Math.round(pointWgs84.y * 1000000) / 1000000}`);
  }

  const initializeMap = () => {
    ctx.statePlane = new SpatialReference({wkid: 32039});
    ctx.statePlaneName = 'NAD27 - Texas Central';

    const map = new Map({
      basemap: "gray-vector"
    });

    ctx.view = new MapView({
      container: mapRef.current,
      map: map,
      center:  [-102.55, 31.02],
      zoom: 14
    });
    ctx.view.ui.remove("zoom");
    ctx.view.ui.remove("attribution");

    viewRef.current = ctx.view;

    const layer = new FeatureLayer({
      url: 'https://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/Leases/FeatureServer/0',
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [255, 255, 0, 0.2],
          outline: {
            color: [0, 0, 0, .2],
            width: 1
          }
        })
      })
    });

    map.add(layer);
    map.add(ctx.graphicsLayer);
    map.add(ctx.secondLayer);

    ctx.view.on('click', async (event: ViewClickEvent) => {
      ctx.click(event);
    });

    ctx.view.on('double-click', (event: ViewDoubleClickEvent) => {
      ctx.dblclick(event);
    });

    ctx.view.on('pointer-move', (event: ViewPointerMoveEvent) => {
      calcPointerLocation(event);
      ctx.move(event);
    });

    ctx.view.on('drag', (event: ViewDragEvent) => {
      ctx.drag(event);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        ctx.clearCurrent();
      }

      // if (event.key === 'Delete') {
      //   ctx.deleteCurrentModel();
      // }
    });

    GeoTest.test(ctx)
  };

  useEffect(() => {
    if (ctx.view) {
      ctx.view.container = mapRef.current as HTMLDivElement;
    }
    else {
      projectOperator.load().then(() => {
        initializeMap();
      }).catch((error) => {
        console.error('Error loading projection:', error);
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.container = null;
      }
    };
  }, []);

  return (
    <div style={{height: "100%", width: "100%"}}>
      <div className="mapDiv" ref={mapRef} style={{display: 'flex', flex: 1, height: '100%', width: "100%"}}></div>
    </div>
  );
});

export default MapComponent;
