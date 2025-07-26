import MapView from "@arcgis/core/views/MapView";
import {Point, SpatialReference} from "@arcgis/core/geometry";
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
import {SymbolUtils} from "../symbols/SymbolUtils.tsx";

export class MapController {
  public view: MapView | undefined;
  public statePlane: SpatialReference | undefined;
  public statePlaneName = '';

  public selectedGraphic: Graphic | undefined;

  public currentModel = new EmptyModel();
  public currentBuilder: Builder | undefined;
  public compassHandler: CompassHandler;
  public currentMode: MapModes = MapModes.None;
  public graphicsLayer: GraphicsLayer

  public clickListeners: (() => Promise<void>)[] = [];
  public dragListeners: (() => Promise<void>)[] = [];
  public moveListeners: (() => Promise<void>)[] = [];
  public static readonly instance: MapController = new MapController();

  private constructor() {
    this.graphicsLayer = new GraphicsLayer({
      id: Constants.graphicsLayerName
    });

    this.compassHandler = new CompassHandler(new Point(), 0, this.graphicsLayer);
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

    if (mode === MapModes.TransformBlock) {
      const graphic = this.graphicsLayer.graphics.find(g => g.attributes.model.modelId === this.currentModel.modelId && g.attributes.role === ModelRoles.Block);
      if (graphic) {
        this.currentBuilder = new RectTransformer(graphic, this.graphicsLayer.graphics);
        this.currentBuilder.activate();
      }
    }
  }

  public selectGraphic(graphic: Graphic): void {
    if (this.selectedGraphic) {
      this.selectedGraphic.symbol = SymbolUtils.normal(this.selectedGraphic.attributes.role);
    }
    this.selectedGraphic = graphic;
    graphic.symbol = SymbolUtils.selected(graphic.attributes.role)

    if (graphic.attributes.role === ModelRoles.Stick) {
      this.compassHandler.updateFromVertices([graphic.attributes.model.anchorPoint, graphic.attributes.model.endPoint]);
    }
    else {
      this.compassHandler.updateFromVertices(graphic.attributes.model.vertices);
    }
  }

  public async click(event: ViewClickEvent): Promise<void> {
    if (this.currentMode === MapModes.None) {
      const response = await this.view!.hitTest(event);

      if (response.results && response.results.length > 0) {
        const gh = response.results.map(r => r as MapViewGraphicHit);

        const sticks = gh.filter(r => r.graphic.attributes && r.graphic.attributes.role === ModelRoles.Stick);
        if (sticks.length > 0) {
          this.selectGraphic(sticks[0].graphic);
          return;
        }
        const blocks = gh.filter(r => r.graphic.attributes && r.graphic.attributes.role === ModelRoles.Block);
        if (blocks.length > 0) {
          this.selectGraphic(blocks[0].graphic);
          return;
        }
      }
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.buttons, 'click');
    switch (this.currentMode) {
      case MapModes.DrawStick:
        LineBuildHandler.click(this, evx, ModelRoles.Stick);
        break;
      case MapModes.DrawBlockRect:
        RectBuildHandler.click(this, evx);
        break;
      case MapModes.DrawBlockPolygon:
        PolygonBuildHandler.click(this, evx);
        break;
      case MapModes.TransformBlock:
        this.hitTest(event, RectTransformHandler.click);
        break;
    }

    Promise.all(this.clickListeners.map(fn => fn()));
  }

  public dblclick(event: ViewDoubleClickEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.buttons, 'dblclick');
    switch (this.currentMode) {
      case MapModes.DrawStick:
        LineBuildHandler.click(this, evx, ModelRoles.Stick);
        break;
      case MapModes.DrawBlockRect:
        RectBuildHandler.click(this, evx);
        break;
      case MapModes.DrawBlockPolygon:
        PolygonBuildHandler.dblclick(this, evx);
        break;
      case MapModes.TransformBlock:
        this.hitTest(event, RectTransformHandler.dblclick);
        break;
    }

    Promise.all(this.clickListeners.map(fn => fn()));
  }

  public move(event: ViewPointerMoveEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    const evx = new MouseEventModel(this.toStatePlane(event), event.button, 'move');
    switch (this.currentMode) {
      case MapModes.DrawStick:
        if (LineBuildHandler.move(this, evx)) {
          Promise.all(this.moveListeners.map(fn => fn()));
        }
        break;
      case MapModes.DrawBlockRect:
        if (RectBuildHandler.move(this, evx)) {
          Promise.all(this.moveListeners.map(fn => fn()));
        }
        break;
      case MapModes.DrawBlockPolygon:
        if (PolygonBuildHandler.move(this, evx)) {
          Promise.all(this.moveListeners.map(fn => fn()));
        }
        break;
      case MapModes.TransformBlock:
        if (RectTransformHandler.move(this, evx)) {
          Promise.all(this.moveListeners.map(fn => fn()));
        }
        break;
    }
  }

  public drag(event: ViewDragEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    switch (this.currentMode) {
      case MapModes.TransformBlock:
        this.hitTest(event, RectTransformHandler.drag);
        Promise.all(this.dragListeners.map(fn => fn()));
        break;
    }
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
