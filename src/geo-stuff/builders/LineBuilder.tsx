import Graphic from '@arcgis/core/Graphic';
import {Point, Polyline} from '@arcgis/core/geometry';
import Collection from "@arcgis/core/core/Collection";
import {PointSymbolUtils} from "../utils/PointSymbolUtils.tsx";
import {EditingSymbolUtils} from "../utils/EditingSymbolUtils.tsx";
import {LineSymbolUtils} from "../utils/LineSymbolUtils.tsx";
import {LineModel} from "../models/LineModel.tsx";
import {ModelAttributes} from "../utils/ModelAttributes.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";

export class LineBuilder implements Builder {
  readonly builderType = BuilderTypes.LineBuilder;
  graphics: Collection<Graphic>;
  model: LineModel;
  lineGraphic: Graphic;
  anchorGraphic: Graphic;
  endPointGraphic: Graphic;
  finishCallback: ((model: LineModel) => void) | undefined;

  constructor(anchorPoint: Point, graphics: Collection<Graphic>) {
    this.model = new LineModel(anchorPoint);
    this.graphics = graphics;

    this.lineGraphic = new Graphic({
      geometry: new Polyline({
        paths: [[[this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y]]],
        spatialReference: this.model.anchorPoint.spatialReference
      }),
      symbol: EditingSymbolUtils.lineSymbol(),
      attributes: {
        modelAttributes: new ModelAttributes(this.model, ModelRoles.Line, 0)
      }
    });

    this.anchorGraphic = new Graphic({
      geometry: this.model.anchorPoint,
      symbol: PointSymbolUtils.redX(),
      attributes: {
        modelAttributes: new ModelAttributes(this.model, ModelRoles.AnchorPoint, 0)
      }
    });

    this.endPointGraphic = new Graphic({
      geometry: this.model.endPoint,
      symbol: PointSymbolUtils.redCircle(),
      attributes: {
        modelAttributes: new ModelAttributes(this.model, ModelRoles.EndPoint, 0)
      }
    });

    this.graphics.addMany([this.lineGraphic, this.anchorGraphic, this.endPointGraphic]);
  }

  move(evx: MouseEventModel): void {
    this.model.endPoint = evx.projectedPoint;

    this.lineGraphic.geometry = new Polyline({
      paths: [[[this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y]]],
      spatialReference: this.model.anchorPoint.spatialReference
    });

    this.endPointGraphic.geometry = this.model.endPoint;
  }

  click(evx: MouseEventModel): void {
    this.move(evx);

    if (this.finishCallback) {
      this.lineGraphic.symbol = LineSymbolUtils.blackSolid();
      this.endPointGraphic.symbol = PointSymbolUtils.blackCircle();
      this.finishCallback(this.model);
    }
  }

  dblclick(evx: MouseEventModel) {
    this.click(evx);
  }

  activate(): void {
  }

  deactivate(): void {
  }

  destroy(): void {
    this.graphics.removeMany([this.lineGraphic, this.anchorGraphic, this.endPointGraphic]);
  }

  onFinish(finishCallback: (model: LineModel) => void): void {
    this.finishCallback = finishCallback
  }
}
