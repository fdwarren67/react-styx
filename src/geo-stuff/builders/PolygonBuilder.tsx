import Graphic from '@arcgis/core/Graphic';
import {Point, Polygon} from '@arcgis/core/geometry';
import {GeometryUtils} from '../utils/GeometryUtils.tsx';
import Collection from "@arcgis/core/core/Collection";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {LineModel} from "../models/LineModel.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {Model} from "../models/Model.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {PolygonModel} from "../models/PolygonModel.tsx";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import {BlockSymbolUtils} from "../symbols/BlockSymbolUtils.tsx";

export class PolygonBuilder implements Builder {
  readonly builderType = BuilderTypes.PolygonBuilder;
  graphics: Collection<Graphic>;
  model: PolygonModel;
  polygonGraphic: Graphic;
  fillSymbol: SimpleFillSymbol;
  labelGraphics: Graphic[] = [];
  finishCallback: ((model: PolygonModel) => void) | undefined;

  constructor(vertices: Point[], graphics: Collection<Graphic>) {
    this.model = new PolygonModel(vertices);
    this.graphics = graphics;
    this.fillSymbol = BlockSymbolUtils.building();

    this.polygonGraphic = new Graphic({
      geometry: new Polygon({
        rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
        spatialReference: this.model.vertices[0].spatialReference
      }),
      symbol: this.fillSymbol,
      attributes: {
        model: this.model,
        role: ModelRoles.Block,
        index: 0
      }
    });

    for (let i = 0; i < vertices.length - 1; i++) {
      this.pushLabelGraphic(vertices[i], vertices[i + 1], i);
    }

    graphics.addMany([...this.labelGraphics, this.polygonGraphic]);
  }

  public static fromBasePoints(model: Model, graphics: Collection<Graphic>): PolygonBuilder {
    const lineModel = model as LineModel;

    const vertices = [
      lineModel.anchorPoint,
      lineModel.endPoint,
      GeometryUtils.offsetPoint(lineModel.endPoint, 5, 0)
    ];

    return new PolygonBuilder(vertices, graphics);
  }

  move(evx: MouseEventModel): void {
    this.model.vertices[this.model.vertices.length - 1] = evx.projectedPoint;

    this.polygonGraphic.geometry = new Polygon({
      rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
      spatialReference: this.model.vertices[0].spatialReference
    });

    const idx = this.labelGraphics.length - 2;
    this.labelGraphics[idx].geometry = GeometryUtils.centerPoint([this.model.vertices[idx], this.model.vertices[idx + 1]]);
    this.labelGraphics[idx].symbol = this.calcLabelSymbol(this.model.vertices[idx], this.model.vertices[idx + 1]);

    this.labelGraphics[idx + 1].geometry = GeometryUtils.centerPoint([this.model.vertices[idx + 1], evx.projectedPoint]);
    this.labelGraphics[idx + 1].symbol = this.calcLabelSymbol(this.model.vertices[idx + 1], evx.projectedPoint);
  }

  click(evx: MouseEventModel): void {
    this.move(evx);

    this.model.vertices.push(GeometryUtils.offsetPoint(evx.projectedPoint, 5, 0));

    const idx = this.model.vertices.length - 2;
    this.pushLabelGraphic(this.model.vertices[idx], this.model.vertices[idx + 1], idx);
    this.graphics.add(this.labelGraphics[this.labelGraphics.length - 1]);
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
    this.polygonGraphic.symbol = BlockSymbolUtils.normal();

    const idx = this.labelGraphics.length - 1;
    this.labelGraphics[idx].geometry = GeometryUtils.centerPoint([this.model.vertices[idx], this.model.vertices[0]]);
    this.labelGraphics[idx].symbol = this.calcLabelSymbol(this.model.vertices[idx], this.model.vertices[0]);

    if (this.finishCallback) {
      this.finishCallback(this.model);
    }
  }

  activate(): void {
//    this.polygonGraphic.symbol = FillSymbolUtils.red();
  }

  deactivate(): void {
  }

  destroy(): void {
    this.graphics.remove(this.polygonGraphic);
  }

  onFinish(finishCallback: (model: PolygonModel) => void): void {
    this.finishCallback = finishCallback
  }

  private pushLabelGraphic(pt1: Point, pt2: Point, idx: number): void {
    this.labelGraphics.push(new Graphic({
      geometry: GeometryUtils.centerPoint([pt1, pt2]),
      symbol: this.calcLabelSymbol(pt1, pt2),
      attributes: {
        model: this.model,
        role: ModelRoles.LineLabel,
        index: idx
      }
    }));
  }

  private calcLabelSymbol(pt1: Point, pt2: Point): TextSymbol {
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
