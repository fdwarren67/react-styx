import Graphic from '@arcgis/core/Graphic';
import {Point, Polyline} from '@arcgis/core/geometry';
import Collection from "@arcgis/core/core/Collection";
import {LineModel} from "../models/LineModel.tsx";
import {Builder} from "./Builder.tsx";
import {BuilderTypes, GraphicRoles, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import {BlockSymbolUtils} from "../symbols/BlockSymbolUtils.tsx";
import {StickSymbolUtils} from "../symbols/StickSymbolUtils.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {AnchorPointSymbolUtils} from "../symbols/AnchorPointSymbolUtils.tsx";
import {EndPointSymbolUtils} from "../symbols/EndPointSymbolUtils.tsx";

export class LineBuilder implements Builder {
  readonly builderType = BuilderTypes.LineBuilder;
  graphics: Collection<Graphic>;
  model: LineModel;
  lineGraphic: Graphic;
  anchorGraphic: Graphic;
  endPointGraphic: Graphic;
  labelGraphic: Graphic;
  finishCallback: ((model: LineModel) => void) | undefined;

  constructor(anchorPoint: Point, graphics: Collection<Graphic>, modelRole: ModelRoles) {
    this.model = new LineModel(anchorPoint, modelRole);
    this.graphics = graphics;

    this.lineGraphic = new Graphic({
      geometry: new Polyline({
        paths: [[[this.model.anchorPoint.x, this.model.anchorPoint.y], [this.model.endPoint.x, this.model.endPoint.y]]],
        spatialReference: this.model.anchorPoint.spatialReference
      }),
      symbol: modelRole === ModelRoles.Block ? BlockSymbolUtils.building() : StickSymbolUtils.building(),
      attributes: {
        model: this.model,
        index: 0
      }
    });

    this.anchorGraphic = new Graphic({
      geometry: this.model.anchorPoint,
      symbol: AnchorPointSymbolUtils.building(),
      attributes: {
        model: this.model,
        role: GraphicRoles.AnchorPoint
      }
    });

    this.endPointGraphic = new Graphic({
      geometry: this.model.endPoint,
      symbol: EndPointSymbolUtils.building(),
      attributes: {
        model: this.model,
        role: GraphicRoles.EndPoint
      }
    });

    this.labelGraphic = new Graphic({
      geometry: GeometryUtils.centerPoint([this.model.anchorPoint, this.model.endPoint]),
      symbol: this.calcLabelSymbol(),
      attributes: {
        model: this.model,
        role: GraphicRoles.LineLabel
      }
    });

    this.graphics.addMany([this.lineGraphic, this.anchorGraphic, this.endPointGraphic, this.labelGraphic]);
  }

  move(evx: MouseEventModel): void {
    this.model.updateVertex(1, evx.projectedPoint);

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
      this.lineGraphic.symbol = StickSymbolUtils.normal();
      this.endPointGraphic.symbol = EndPointSymbolUtils.normal();
      MapController.instance.selectGraphic(this.lineGraphic);
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
