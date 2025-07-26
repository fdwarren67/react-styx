import Graphic from '@arcgis/core/Graphic';
import {Point, Polygon} from '@arcgis/core/geometry';
import {GeometryUtils} from '../utils/GeometryUtils.tsx';
import Collection from "@arcgis/core/core/Collection";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {PolygonModel} from "../models/PolygonModel.tsx";
import {LineModel} from "../models/LineModel.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {Model} from "../models/Model.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import {BlockSymbolUtils} from "../symbols/BlockSymbolUtils.tsx";

export class RectBuilder implements Builder {
  readonly builderType = BuilderTypes.RectBuilder;
  graphics: Collection<Graphic>;
  model: PolygonModel;
  rectGraphic: Graphic;
  anchorLabelGraphic: Graphic;
  sideLabelGraphic: Graphic;
  symbol: SimpleFillSymbol;
  finishCallback: ((model: PolygonModel) => void) | undefined;

  constructor(vertices: Point[], graphics: Collection<Graphic>) {
    this.model = new PolygonModel(vertices);
    this.graphics = graphics;
    this.symbol = BlockSymbolUtils.building();

    this.rectGraphic = new Graphic({
      geometry: new Polygon({
        rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
        spatialReference: this.model.vertices[0].spatialReference
      }),
      symbol: this.symbol,
      attributes: {
        model: this.model,
        role: ModelRoles.Block,
        index: 0
      }
    });

    this.anchorLabelGraphic = new Graphic({
      geometry: GeometryUtils.centerPoint([vertices[0], vertices[1]]),
      symbol: this.calcLabelSymbol(vertices[0], vertices[1]),
      attributes: {
        model: this.model,
        role: ModelRoles.LineLabel,
        index: 0
      }
    });

    this.sideLabelGraphic = new Graphic({
      geometry: GeometryUtils.centerPoint([vertices[1], vertices[2]]),
      symbol: this.calcLabelSymbol(vertices[1], vertices[2]),
      attributes: {
        model: this.model,
        role: ModelRoles.LineLabel,
        index: 0
      }
    });

    graphics.addMany([this.rectGraphic, this.anchorLabelGraphic, this.sideLabelGraphic]);
  }

  public static fromBasePoints(model: Model, graphics: Collection<Graphic>) {
    const lineModel = model as LineModel;

    const vertices = [
      lineModel.anchorPoint,
      lineModel.endPoint,
      GeometryUtils.offsetPoint(lineModel.endPoint, 5, 0),
      GeometryUtils.offsetPoint(lineModel.anchorPoint, 5, 0)
    ];

    return new RectBuilder(vertices, graphics);
  }

  move(evx: MouseEventModel): void {
    const point = evx.projectedPoint;

    const baseRadians = GeometryUtils.radians(this.model.vertices[1], this.model.vertices[0]);
    const activeRadians = GeometryUtils.radians(this.model.vertices[1], point);

    let diff = (baseRadians - activeRadians) % (Math.PI * 2);
    if (diff > Math.PI) {
      diff -= Math.PI * 2;
    }

    const thirdRadians = diff >= Math.PI ? baseRadians + Math.PI / 2 : baseRadians - Math.PI / 2;
    const vector = this.model.vertices[1].distance(point) * (diff < 0 ? 1 : -1);

    this.model.vertices[2] = new Point({
      x: this.model.vertices[1].x - Math.cos(thirdRadians) * vector,
      y: this.model.vertices[1].y - Math.sin(thirdRadians) * vector,
      spatialReference: this.model.vertices[0].spatialReference
    });

    this.model.vertices[3] = new Point({
      x: this.model.vertices[0].x - Math.cos(thirdRadians) * vector,
      y: this.model.vertices[0].y - Math.sin(thirdRadians) * vector,
      spatialReference: this.model.vertices[0].spatialReference
    });

    this.rectGraphic.geometry = new Polygon({
      rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
      spatialReference: this.model.vertices[0].spatialReference
    });

    this.sideLabelGraphic.geometry = GeometryUtils.centerPoint([this.model.vertices[1], this.model.vertices[2]]);
    this.sideLabelGraphic.symbol = this.calcLabelSymbol(this.model.vertices[1], this.model.vertices[2])
  }

  click(evx: MouseEventModel): void {
    this.rectGraphic.symbol = BlockSymbolUtils.building();
    this.move(evx);

    if (this.finishCallback) {
      this.rectGraphic.symbol = BlockSymbolUtils.normal();
      this.finishCallback(this.model);
    }
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
  }

  activate(): void {
    this.rectGraphic.symbol = BlockSymbolUtils.normal();
  }

  deactivate(): void {
  }

  destroy(): void {
    this.graphics.remove(this.rectGraphic);
  }

  onFinish(finishCallback: (model: PolygonModel) => void): void {
    this.finishCallback = finishCallback
  }

  calcLabelSymbol(pt1: Point, pt2: Point): TextSymbol {
    const length = Math.round(GeometryUtils.distance([pt1.x, pt1.y], [pt2.x, pt2.y])).toLocaleString();
    const azimuth = Math.round(GeometryUtils.azimuth(pt1, pt2) * 100) / 100;

    const multi = azimuth / Math.abs(azimuth);
    const radians = -GeometryUtils.radians(pt1, pt2);
    const offsetY = (multi * Math.cos(radians) * 10) + 'px';
    const offsetX = (multi * Math.sin(radians) * 10) + 'px';
    let angle = -GeometryUtils.degrees(pt2, pt1)
    if (azimuth > 0) {
      angle += 180;
    }

    return new TextSymbol({
      text: `${length} ft        ${azimuth}\u00B0`,
      angle: angle,
      xoffset: offsetX,
      yoffset: offsetY,
      color: "#ff000066",
      haloColor: "white",
      haloSize: "1px",
      font: {
        size: 12,
        family: "sans-serif",
        weight: "bold"
      },
      horizontalAlignment: "center",
      verticalAlignment: "middle"
    });
  }
}
