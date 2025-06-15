import Graphic from '@arcgis/core/Graphic';
import {Point, Polygon} from '@arcgis/core/geometry';
import {GeometryUtils} from '../utils/GeometryUtils.tsx';
import Collection from "@arcgis/core/core/Collection";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {FillSymbolUtils} from "../utils/FillSymbolUtils.tsx";
import {LineModel} from "../models/LineModel.tsx";
import {ModelAttributes} from "../utils/ModelAttributes.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {Model} from "../models/Model.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {EditingSymbolUtils} from "../utils/EditingSymbolUtils.tsx";
import {RectModel} from "../models/RectModel.tsx";

export class PolygonBuilder implements Builder {
  readonly builderType = BuilderTypes.PolygonBuilder;
  graphics: Collection<Graphic>;
  model: RectModel;
  polygonGraphic: Graphic;
  fillSymbol: SimpleFillSymbol;
  finishCallback: ((model: RectModel) => void) | undefined;

  constructor(vertices: Point[], graphics: Collection<Graphic>) {
    this.model = new RectModel(vertices);
    this.graphics = graphics;
    this.fillSymbol = EditingSymbolUtils.fillSymbol();

    this.polygonGraphic = new Graphic({
      geometry: new Polygon({
        rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
        spatialReference: this.model.vertices[0].spatialReference
      }),
      symbol: this.fillSymbol,
      attributes: {
        modelAttributes: new ModelAttributes(this.model, ModelRoles.Polygon, 0)
      }
    });

    graphics.add(this.polygonGraphic);
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
  }

  click(evx: MouseEventModel): void {
    this.move(evx);

    this.model.vertices.push(GeometryUtils.offsetPoint(evx.projectedPoint, 5, 0));
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
    this.polygonGraphic.symbol = FillSymbolUtils.red();

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

  onFinish(finishCallback: (model: RectModel) => void): void {
    this.finishCallback = finishCallback
  }
}
