import MapView from "@arcgis/core/views/MapView";
import {Point, SpatialReference} from "@arcgis/core/geometry";
import {Constants, GraphicRoles, MapModes, ModelRoles} from "../utils/Constants.tsx";
import {LineBuildHandler} from "../handlers/LineBuildHandler.tsx";
import {RectBuildHandler} from "../handlers/RectBuildHandler.tsx";
import {RectResizeHandler} from "../handlers/RectResizeHandler.tsx";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import {Builder} from "../builders/Builder.tsx";
import {EmptyViewModel} from "../view-models/EmptyViewModel.tsx";
import {MouseEventModel} from "../view-models/MouseEventModel.tsx";
import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator.js";
import {PolygonBuildHandler} from "../handlers/PolygonBuildHandler.tsx";
import {CompassHandler} from "../handlers/CompassHandler.tsx";
import {SymbolUtils} from "../symbols/SymbolUtils.tsx";
import {GraphicsUtils} from "../utils/GraphicsUtils.tsx";
import {ViewModel} from "../view-models/ViewModel.tsx";
import {RectResizer} from "../builders/RectResizer.tsx";
import {AzimuthViewModel} from "../view-models/AzimuthViewModel.tsx";
import ViewClickEvent = __esri.ViewClickEvent;
import ViewPointerMoveEvent = __esri.ViewPointerMoveEvent;
import MapViewGraphicHit = __esri.MapViewGraphicHit;
import ViewDoubleClickEvent = __esri.ViewDoubleClickEvent;
import ViewDragEvent = __esri.ViewDragEvent;
import {Settings} from "../../../common/Settings.tsx";
import {BlockViewModel} from "../view-models/BlockViewModel.tsx";

export class MapController {
  view: MapView | undefined;
  statePlane: SpatialReference | undefined;
  statePlaneName = '';

  selectedGraphic: Graphic | undefined;
  selectionListeners: ((model: ViewModel) => Promise<void>)[] = [];

  currentModel: ViewModel = new EmptyViewModel();
  currentBuilder: Builder | undefined;
  currentMode: MapModes = MapModes.None;
  graphicsLayer: GraphicsLayer
  secondLayer: GraphicsLayer;

  clickListeners: (() => Promise<void>)[] = [];
  dragListeners: (() => Promise<void>)[] = [];
  moveListeners: (() => Promise<void>)[] = [];

  private compassHandler: CompassHandler;

  static readonly instance: MapController = new MapController();

  private constructor() {
    this.graphicsLayer = new GraphicsLayer({
      id: Constants.graphicsLayerName
    });
    this.secondLayer = new GraphicsLayer({
      id: "SecondLayer"
    });

    this.compassHandler = new CompassHandler(new Point(), 0, this.graphicsLayer);
  }

  toStatePlane(event: ViewClickEvent | ViewDoubleClickEvent | ViewDragEvent | ViewPointerMoveEvent): Point {
    return projectOperator.execute(this.view!.toMap(event), this.statePlane!) as Point;
  }

  setMode(mode: MapModes) {
    this.currentMode = mode;
    if (this.currentBuilder) {
      this.currentBuilder.deactivate();
    }
    this.currentBuilder = undefined;

    if (mode === MapModes.ResizeBlock) {
      const graphic = this.graphicsLayer.graphics.find(g => g.attributes && g.attributes.model.id === this.currentModel.id && GraphicsUtils.modelRoleEquals(g, ModelRoles.Block));
      if (graphic) {
        this.currentBuilder = new RectResizer(graphic, this.graphicsLayer.graphics);
        this.currentBuilder.activate();
      }
    }
  }

  builderFinished(): void {
    if (this.currentMode === MapModes.DrawBlockRect) {
      const block: BlockViewModel = this.currentModel as BlockViewModel;
      block.applyFieldRules(Settings.instance.fieldRules);
    }
  }

  selectGraphic(graphic: Graphic | undefined): void {
    if (this.selectedGraphic) {
      this.selectedGraphic.symbol = SymbolUtils.normal(this.selectedGraphic.attributes.model.role);
    }

    let model = undefined;

    this.selectedGraphic = graphic;
    if (graphic) {
      graphic.symbol = SymbolUtils.selected(graphic.attributes.model.role)

      this.compassHandler.updateFromModel(graphic.attributes.model);

      model = graphic.attributes.model;
    }

    this.currentModel = model;
    Promise.all(this.selectionListeners.map(fn => fn(model)));
  }

  currentModelUpdated(): void {
    this.compassHandler.updateFromModel(this.currentModel as AzimuthViewModel);
  }

  deleteCurrentModel(): void {
    this.deleteGraphicsByModel(this.currentModel.id);
    this.compassHandler.hide();
    this.clearCurrent();
  }

  deleteGraphicsByModel(modelId: number): void {
    const gg = GraphicsUtils.findMatchingGraphics(modelId);
    this.graphicsLayer.removeMany(gg);
    this.selectGraphic(undefined);
    this.currentModel = new EmptyViewModel();
  }

  async click(event: ViewClickEvent): Promise<void> {
    if (this.currentMode === MapModes.None) {
      const response = await this.view!.hitTest(event);

      if (response.results && response.results.length > 0) {
        const gh = response.results.map(r => r as MapViewGraphicHit);

        const sticks = gh.filter(r => GraphicsUtils.modelRoleEquals(r.graphic, ModelRoles.Stick));
        if (sticks.length > 0) {
          this.selectGraphic(sticks[0].graphic);
          return;
        }
        const blocks = gh.filter(r => GraphicsUtils.modelRoleEquals(r.graphic, ModelRoles.Block));
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
      case MapModes.ResizeBlock:
        this.hitTest(event, RectResizeHandler.click);
        break;
    }

    Promise.all(this.clickListeners.map(fn => fn()));
  }

  dblclick(event: ViewDoubleClickEvent): void {
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
      case MapModes.ResizeBlock:
        this.hitTest(event, RectResizeHandler.dblclick);
        break;
    }

    Promise.all(this.clickListeners.map(fn => fn()));
  }

  move(event: ViewPointerMoveEvent): void {
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
      case MapModes.ResizeBlock:
        if (RectResizeHandler.move(this, evx)) {
          Promise.all(this.moveListeners.map(fn => fn()));
        }
        break;
    }
  }

  drag(event: ViewDragEvent): void {
    if (this.currentMode === MapModes.None) {
      return;
    }

    event.stopPropagation();

    switch (this.currentMode) {
      case MapModes.ResizeBlock:
        this.hitTest(event, RectResizeHandler.drag);
        Promise.all(this.dragListeners.map(fn => fn()));
        break;
    }
  }

  hitTest(event: ViewClickEvent | ViewDoubleClickEvent | ViewDragEvent | ViewPointerMoveEvent, callback: (ctx: MapController, evx: MouseEventModel, graphics: Graphic) => void): void {
    this.view!.hitTest(event).then((response): void => {
      const evx = new MouseEventModel(this.toStatePlane(event), event.button, "action" in event ? event.action : 'hit');
      response.results.forEach(res => {
        callback(this, evx, (res as MapViewGraphicHit).graphic);
      });
    });
  }

  flipCurrentAzimuth(): void {
    const az = this.currentModel as AzimuthViewModel;
    if (az !== null) {
      az.flipAzimuth();
    }

    if (az!.role === ModelRoles.Stick) {
      const anchorGraphic = GraphicsUtils.findMatchingGraphics(az.id, GraphicRoles.AnchorPoint)[0];
      const endGraphic = GraphicsUtils.findMatchingGraphics(az.id, GraphicRoles.EndPoint)[0];

      GraphicsUtils.swapGraphics(anchorGraphic, endGraphic)
    }

    this.compassHandler.updateFromModel(az);
  }

  getCurrentModelRole(): ModelRoles {
    switch (this.currentMode) {
      case MapModes.DrawStick:
        return ModelRoles.Stick;
      case MapModes.DrawBlockRect:
        return ModelRoles.Block;
      case MapModes.DrawBlockPolygon:
        return ModelRoles.Block;
      default:
        return ModelRoles.None
    }
  }

  clearCurrent(): void {
    if (this.currentBuilder) {
      this.currentBuilder.destroy();
    }
    this.currentModel = new EmptyViewModel();
    this.setMode(MapModes.None);
    this.compassHandler.hide();
    this.selectGraphic(undefined);
  }
}
