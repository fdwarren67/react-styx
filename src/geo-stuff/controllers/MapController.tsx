import MapView from "@arcgis/core/views/MapView";
import {Point, Polygon, SpatialReference} from "@arcgis/core/geometry";
import {Constants, MapModes, ModelRoles} from "../utils/Constants.tsx";
import {LineBuildHandler} from "../handlers/LineBuildHandler.tsx";
import {RectBuildHandler} from "../handlers/RectBuildHandler.tsx";
import {RectTransformHandler} from "../handlers/RectTransformHandler.tsx";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import {Builder} from "../builders/Builder.tsx";
import {EmptyModel} from "../models/EmptyModel.tsx";
import {RectTransformer} from "../builders/RectTransformer.tsx";
import ViewClickEvent = __esri.ViewClickEvent;
import ViewPointerMoveEvent = __esri.ViewPointerMoveEvent;
import MapViewGraphicHit = __esri.MapViewGraphicHit;
import ViewDoubleClickEvent = __esri.ViewDoubleClickEvent;
import ViewDragEvent = __esri.ViewDragEvent;
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import {PolygonBuildHandler} from "../handlers/PolygonBuildHandler.tsx";
import {CompassHandler} from "../handlers/CompassHandler.tsx";
import {FillSymbolUtils} from "../utils/FillSymbolUtils.tsx";

export class MapController {
  public view: MapView | undefined;
  public statePlane: SpatialReference | undefined;
  public statePlaneName = '';

  public currentModel = new EmptyModel();
  public currentBuilder: Builder | undefined;
  public compassHandler: CompassHandler;
  public currentMode: MapModes = MapModes.None;
  public graphicsLayer: GraphicsLayer

  public listeners: (() => Promise<void>)[] = [];
  public static readonly instance: MapController = new MapController();

  private constructor() {
    this.graphicsLayer = new GraphicsLayer({
      id: Constants.graphicsLayerName
    });

    this.compassHandler = new CompassHandler(new Point(), 0);
    this.graphicsLayer.addMany([this.compassHandler.azimuthGraphic, this.compassHandler.normalGraphic, this.compassHandler.innerCircleGraphic, this.compassHandler.outerCircleGraphic]);
  }

  public toStatePlane(event: ViewClickEvent | ViewDoubleClickEvent | ViewDragEvent | ViewPointerMoveEvent): Point {
    return projectOperator.execute(this.view!.toMap(event), this.statePlane!) as Point;
  }

  public setMode(mode: MapModes) {
    this.currentMode = mode;
    if (this.currentBuilder) {
      this.currentBuilder.deactivate();
    }
    this.currentBuilder = undefined;

    if (mode === MapModes.TransformRect) {
      const graphic = this.graphicsLayer.graphics.find(g => g.attributes.modelAttributes.model.modelId === this.currentModel.modelId && g.attributes.modelAttributes.role === ModelRoles.Polygon);
      if (graphic) {
        this.currentBuilder = new RectTransformer(graphic, this.graphicsLayer.graphics);
        this.currentBuilder.activate();
      }
    }
  }

  public click(event: ViewClickEvent): void {
    if (this.currentMode === MapModes.None) {
      this.hitTest(event, (ctx: MapController, evx: MouseEventModel, graphic: Graphic) => {
        if (graphic.attributes.FID) {
          ctx.graphicsLayer.add(new Graphic({
            geometry: new Polygon({
              rings: (graphic.geometry as Polygon).rings,
              spatialReference: graphic.geometry!.spatialReference
            }),
            symbol: FillSymbolUtils.red()
          }));
        }
      });

      return;
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.buttons, 'click');
    switch (this.currentMode) {
      case MapModes.DrawLine:
        LineBuildHandler.click(this, evx);
        break;
      case MapModes.DrawRect:
        RectBuildHandler.click(this, evx);
        break;
      case MapModes.DrawPolygon:
        PolygonBuildHandler.click(this, evx);
        break;
      case MapModes.TransformRect:
        this.hitTest(event, RectTransformHandler.click);
        break;
    }

    Promise.all(this.listeners.map(fn => fn()));
  }

  public dblclick(event: ViewDoubleClickEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.buttons, 'dblclick');
    switch (this.currentMode) {
      case MapModes.DrawLine:
        LineBuildHandler.click(this, evx);
        break;
      case MapModes.DrawRect:
        RectBuildHandler.click(this, evx);
        break;
      case MapModes.DrawPolygon:
        PolygonBuildHandler.dblclick(this, evx);
        break;
      case MapModes.TransformRect:
        this.hitTest(event, RectTransformHandler.dblclick);
        break;
    }

    Promise.all(this.listeners.map(fn => fn()));
  }

  public move(event: ViewPointerMoveEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.button, 'move');
    switch (this.currentMode) {
      case MapModes.DrawLine:
        LineBuildHandler.move(this, evx);
        break;
      case MapModes.DrawRect:
        RectBuildHandler.move(this, evx);
        break;
      case MapModes.DrawPolygon:
        PolygonBuildHandler.move(this, evx);
        break;
      case MapModes.TransformRect:
        RectTransformHandler.move(this, evx);
        break;
    }

    Promise.all(this.listeners.map(fn => fn()));
  }

  public drag(event: ViewDragEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    switch (this.currentMode) {
      case MapModes.TransformRect:
        this.hitTest(event, RectTransformHandler.drag);
        break;
    }

    Promise.all(this.listeners.map(fn => fn()));
  }

  public hitTest(event: ViewClickEvent | ViewDoubleClickEvent | ViewDragEvent | ViewPointerMoveEvent, callback: (ctx: MapController, evx: MouseEventModel, graphics: Graphic) => void): void {
    this.view!.hitTest(event).then((response): void => {
      const evx = new MouseEventModel(this.toStatePlane(event), event.button, "action" in event ? event.action : 'hit');
      response.results.forEach(res => {
        callback(this, evx, (res as MapViewGraphicHit).graphic);
      });
    });
  }

  // public hitTest2(event: ViewClickEvent | ViewDoubleClickEvent | ViewDragEvent | ViewPointerMoveEvent, callback: (graphic: Graphic) => void): void {
  //   this.view!.hitTest(event).then((response): void => {
  //     let matched = false;
  //     response.results.forEach(res => {
  //       if (!matched && res.layer && res.layer.id === Constants.graphicsLayerName) {
  //         matched = true;
  //         callback((res as MapViewGraphicHit).graphic);
  //       }
  //     });
  //   });
  // }

  public escape(): void {
    if (this.currentBuilder) {
      this.currentBuilder.destroy();
    }
    this.currentModel = new EmptyModel();
    this.setMode(MapModes.None);
  }
}
