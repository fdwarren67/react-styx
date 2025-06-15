import Graphic from '@arcgis/core/Graphic';
import {Point, Polygon, Polyline} from '@arcgis/core/geometry';
import {GeometryUtils} from '../utils/GeometryUtils.tsx';
import Collection from "@arcgis/core/core/Collection";
import {EditingSymbolUtils} from "../utils/EditingSymbolUtils.tsx";
import {FillSymbolUtils} from "../utils/FillSymbolUtils.tsx";
import {RectModel} from "../models/RectModel.tsx";
import Transformation from "@arcgis/core/geometry/operators/support/Transformation";
import * as transOp from "@arcgis/core/geometry/operators/affineTransformOperator.js";
import {PointSymbolUtils} from "../utils/PointSymbolUtils.tsx";
import {ModelAttributes} from "../utils/ModelAttributes.tsx";
import {GraphicUtils} from "../utils/GraphicUtils.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";

export class RectTransformer implements Builder {
  readonly builderType = BuilderTypes.RectTransformer;
  graphics: Collection<Graphic>;
  attr: ModelAttributes;
  model: RectModel;
  rectGraphic: Graphic;
  vertexGraphics: Graphic[] = [];
  edgeGraphics: Graphic[] = [];
  finishCallback: ((model: RectModel) => void) | undefined;
  anchorIndex = 0;
  rotatorIndex = -1;
  shifting = false;
  resizerIndex = -1;

  constructor(graphic: Graphic, graphics: Collection<Graphic>) {
    this.graphics = graphics;
    this.attr = GraphicUtils.getModelAttributes(graphic);
    this.model = this.attr.model as RectModel;
    this.rectGraphic = graphic;
    this.rectGraphic.symbol = EditingSymbolUtils.fillSymbol();

    this.model.vertices.forEach((pt, idx) => {
      this.vertexGraphics.push(new Graphic({
        geometry: pt,
        symbol: idx === this.anchorIndex ? PointSymbolUtils.redCircle(10) : PointSymbolUtils.redSquare(6),
        attributes: {
          modelAttributes: new ModelAttributes(this.model, ModelRoles.Vertex, idx)
        }
      }));

      this.edgeGraphics.push(new Graphic({
        geometry: this.createEdgeGeometry(pt, this.model.vertices[(idx + 1) % 4]),
        symbol: EditingSymbolUtils.thickLineSymbol(),
        attributes: {
          modelAttributes: new ModelAttributes(this.model, ModelRoles.Edge, idx)
        }
      }))
    })
  }

  createEdgeGeometry(point1: Point, point2: Point): Polyline {
    const a = [point1.x + .6 * (point2.x - point1.x), point1.y + .6 * (point2.y - point1.y)];
    const b = [(point1.x + point2.x) / 2, (point1.y + point2.y) / 2];
    const c = [point1.x + .4 * (point2.x - point1.x), point1.y + .4 * (point2.y - point1.y)];

    return new Polyline({
      paths: [[a, b, c]],
      spatialReference: point1.spatialReference
    });
  }

  resize(point: Point): void {
    const p1 = this.model.vertices[this.resizerIndex];
    const p2 = this.model.vertices[(this.resizerIndex + 1) % 4];
    const resizer = new Point({
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      spatialReference: point.spatialReference
    });

    const p3 = this.model.vertices[(this.resizerIndex + 2) % 4];
    const p4 = this.model.vertices[(this.resizerIndex + 3) % 4];
    const opposite = new Point({
      x: (p3.x + p4.x) / 2,
      y: (p3.y + p4.y) / 2,
      spatialReference: point.spatialReference
    });

    const baseRadians = GeometryUtils.radians(opposite, resizer);
    const activeRadians = GeometryUtils.radians(opposite, point);

    let diff = (baseRadians - activeRadians) % (Math.PI * 2);
    if (diff > Math.PI) {
      diff -= Math.PI * 2;
    }

    const distance = (point.distance(opposite) - resizer.distance(opposite));
    const thirdRadians = diff >= Math.PI ? -baseRadians : baseRadians;

    const transformer = new Transformation();
    transformer.shift(Math.cos(thirdRadians) * distance, Math.sin(thirdRadians) * distance);

    [this.resizerIndex, (this.resizerIndex + 1) % 4].forEach(index => {
      this.model.vertices[index] = transOp.execute(this.model.vertices[index], transformer) as Point;
      this.vertexGraphics[index].geometry = new Point({
        x: this.model.vertices[index].x,
        y: this.model.vertices[index].y,
        spatialReference: point.spatialReference
      });
    });


    this.model.vertices.forEach((pt, idx) => {
      this.edgeGraphics[idx].geometry = this.createEdgeGeometry(pt, this.model.vertices[(idx + 1) % 4]);
    });

    this.rectGraphic.geometry = new Polygon({
      rings: [this.model.vertices.map(pt => [pt.x, pt.y])],
      spatialReference: point.spatialReference
    })
  }

  transform(point: Point): void {
    let rotateDegrees = 0;
    let shiftX = 0;
    let shiftY = 0;

    const transformer = new Transformation();
    if (this.rotatorIndex > -1) {
      const radians = GeometryUtils.radians(this.model.vertices[this.rotatorIndex], this.model.vertices[this.anchorIndex]);
      const newRadians = GeometryUtils.radians(point, this.model.vertices[this.anchorIndex]);
      const diff = newRadians - radians;
      rotateDegrees = diff / Math.PI * 180;
      transformer.rotate(rotateDegrees, this.model.vertices[this.anchorIndex].x, this.model.vertices[this.anchorIndex].y);
    }

    if (this.shifting) {
      shiftX = point.x - this.model.vertices[this.anchorIndex].x;
      shiftY = point.y - this.model.vertices[this.anchorIndex].y;
      transformer.shift(shiftX, shiftY);
    }

    if (this.rectGraphic.geometry) {
      this.rectGraphic.geometry = transOp.execute(this.rectGraphic.geometry, transformer);
      this.vertexGraphics.forEach((g, idx) => {
        g.geometry = transOp.execute(g.geometry as Point, transformer);
        this.model.vertices[idx] = g.geometry as Point;
      });
      this.edgeGraphics.forEach((g, idx) => {
        g.geometry = transOp.execute(g.geometry as Polyline, transformer);
      });
    }
  }

  click(evx: MouseEventModel): void {
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
  }

  move(evx: MouseEventModel): void {
  }

  activate(): void {
    this.graphics.addMany([...this.vertexGraphics, ...this.edgeGraphics]);
    this.rectGraphic.symbol = EditingSymbolUtils.fillSymbol();
  }

  deactivate(): void {
    this.rectGraphic.symbol = FillSymbolUtils.red();
    this.graphics.removeMany([...this.vertexGraphics, ...this.edgeGraphics]);
    if (this.finishCallback) {
      this.finishCallback(this.model);
    }
  }

  destroy(): void {
  }

  onFinish(finishCallback: (model: RectModel) => void): void {
    this.finishCallback = finishCallback
  }

  setAnchorIndex(anchorIndex: number): void {
    this.vertexGraphics[this.anchorIndex].symbol = PointSymbolUtils.redCircle(6)
    this.anchorIndex = anchorIndex;
    this.vertexGraphics[this.anchorIndex].symbol = PointSymbolUtils.redCircle(10)
  }

  setRotatorIndex(rotatorIndex: number): void {
    this.rotatorIndex = rotatorIndex;
  }
}
