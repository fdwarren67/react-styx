import Graphic from '@arcgis/core/Graphic';
import {Point, Polyline} from '@arcgis/core/geometry';
import Collection from "@arcgis/core/core/Collection";
import {PointSymbolUtils} from "../utils/PointSymbolUtils.tsx";
import {BuildingSymbolUtils} from "../utils/BuildingSymbolUtils.tsx";
import {LineSymbolUtils} from "../utils/LineSymbolUtils.tsx";
import {LineModel} from "../models/LineModel.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";

export class LineBuilder implements Builder {
  readonly builderType = BuilderTypes.LineBuilder;
  graphics: Collection<Graphic>;
  model: LineModel;
  lineGraphic: Graphic;
  anchorGraphic: Graphic;
  endPointGraphic: Graphic;
  labelGraphic: Graphic;
  finishCallback: ((model: LineModel) => void) | undefined;

  constructor(anchorPoint: Point, graphics: Collection<Graphic>) {
    this.model = new LineModel(anchorPoint);
    this.graphics = graphics;

    this.lineGraphic = new Graphic({
      geometry: new Polyline({
        paths: [[[this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y]]],
        spatialReference: this.model.anchorPoint.spatialReference
      }),
      symbol: BuildingSymbolUtils.lineSymbol(),
      attributes: {
        model: this.model,
        role: ModelRoles.Line,
        index: 0
      }
    });

    this.anchorGraphic = new Graphic({
      geometry: this.model.anchorPoint,
      symbol: PointSymbolUtils.redX(),
      attributes: {
        model: this.model,
        role: ModelRoles.AnchorPoint,
        index: 0
      }
    });

    this.endPointGraphic = new Graphic({
      geometry: this.model.endPoint,
      symbol: PointSymbolUtils.redCircle(),
      attributes: {
        model: this.model,
        role: ModelRoles.EndPoint,
        index: 0
      }
    });

    this.labelGraphic = new Graphic({
      geometry: GeometryUtils.centerPoint([this.model.anchorPoint, this.model.endPoint]),
      symbol: this.calcLabelSymbol(),
      attributes: {
        model: this.model,
        role: ModelRoles.LineLabel,
        index: 0
      }
    });

    this.graphics.addMany([this.lineGraphic, this.anchorGraphic, this.endPointGraphic, this.labelGraphic]);
  }

  move(evx: MouseEventModel): void {
    this.model.endPoint = evx.projectedPoint;

    this.lineGraphic.geometry = new Polyline({
      paths: [[[this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y]]],
      spatialReference: this.model.anchorPoint.spatialReference
    });

    this.endPointGraphic.geometry = this.model.endPoint;

    this.labelGraphic.geometry = GeometryUtils.centerPoint([this.model.anchorPoint, this.model.endPoint]);
    this.labelGraphic.symbol = this.calcLabelSymbol();
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
    this.graphics.removeMany([this.lineGraphic, this.anchorGraphic, this.endPointGraphic, this.labelGraphic]);
  }

  onFinish(finishCallback: (model: LineModel) => void): void {
    this.finishCallback = finishCallback
  }

  calcLabelSymbol(): TextSymbol {
    const length = Math.round(GeometryUtils.distance([this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y])).toLocaleString();
    const azimuth = Math.round(GeometryUtils.azimuth(this.model.anchorPoint, this.model.endPoint) * 100) / 100;

    const multi = azimuth / Math.abs(azimuth);
    const radians = -GeometryUtils.radians(this.model.anchorPoint, this.model.endPoint);
    const offsetY = (multi * Math.cos(radians) * 10) + 'px';
    const offsetX = (multi * Math.sin(radians) * 10) + 'px';
    let angle = -GeometryUtils.degrees(this.model.endPoint, this.model.anchorPoint)
    if (azimuth > 0) {
      angle += 180;
    }

    return new TextSymbol({
      text: `${length} ft        ${azimuth}\u00B0`,
      angle: angle,
      xoffset: offsetX,
      yoffset: offsetY,
      color: "#00000066",
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
