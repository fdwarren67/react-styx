import Graphic from '@arcgis/core/Graphic';
import {Point, Polygon} from '@arcgis/core/geometry';
import {GeometryUtils} from '../utils/GeometryUtils.tsx';
import Collection from "@arcgis/core/core/Collection";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {EditingSymbolUtils} from "../utils/EditingSymbolUtils.tsx";
import {FillSymbolUtils} from "../utils/FillSymbolUtils.tsx";
import {RectModel} from "../models/RectModel.tsx";
import {LineModel} from "../models/LineModel.tsx";
import {ModelAttributes} from "../utils/ModelAttributes.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {Model} from "../models/Model.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";

export class RectBuilder implements Builder {
  readonly builderType = BuilderTypes.RectBuilder;
  graphics: Collection<Graphic>;
  model: RectModel;
  rectGraphic: Graphic;
  symbol: SimpleFillSymbol;
  finishCallback: ((model: RectModel) => void) | undefined;

  constructor(vertices: Point[], graphics: Collection<Graphic>) {
    this.model = new RectModel(vertices);
    this.graphics = graphics;
    this.symbol = EditingSymbolUtils.fillSymbol();

    this.rectGraphic = new Graphic({
      geometry: new Polygon({
        rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
        spatialReference: this.model.vertices[0].spatialReference
      }),
      symbol: this.symbol,
      attributes: {
        modelAttributes: new ModelAttributes(this.model, ModelRoles.Polygon, 0)
      }
    });

    graphics.add(this.rectGraphic);
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
  }

  click(evx: MouseEventModel): void {
    this.rectGraphic.symbol = FillSymbolUtils.red();
    this.move(evx);

    if (this.finishCallback) {
      this.finishCallback(this.model);
    }
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
  }

  activate(): void {
    this.rectGraphic.symbol = FillSymbolUtils.red();
  }

  deactivate(): void {
  }

  destroy(): void {
    this.graphics.remove(this.rectGraphic);
  }

  onFinish(finishCallback: (model: RectModel) => void): void {
    this.finishCallback = finishCallback
  }
}
