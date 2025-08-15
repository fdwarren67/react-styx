import {PolygonModel} from "./PolygonModel.tsx";
import {Point, Polygon, Polyline} from "@arcgis/core/geometry";
import {ModelRoles} from "../utils/Constants.tsx";
import {FieldRulesModel} from "./FieldRulesModel.tsx";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator";
import * as unionOperator from "@arcgis/core/geometry/operators/unionOperator";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator";
import * as differenceOperator from "@arcgis/core/geometry/operators/differenceOperator";
import {CompassHandler} from "../handlers/CompassHandler.tsx";
import Graphic from "@arcgis/core/Graphic";
import {MapController} from "../controllers/MapController.tsx";

export class BlockModel extends PolygonModel {
  blockPolygon: Polygon | undefined;
  fieldRulesPolygon: Polygon | undefined;
  drillablePolygon: Polygon | undefined;
  fullCrossSection: Polyline | undefined;
  drillableCrossSection: Polyline | undefined;

  constructor(vertices: Point[]) {
    super(vertices, ModelRoles.Block);
  }

  applyFieldRules(fieldRules: FieldRulesModel): void {
    const segments = GeometryUtils.verticesToSegments(this.vertices);
    const diffAngles = segments.map(s => GeometryUtils.diffAngle(this.azimuth, GeometryUtils.convertPathToAzimuth(s.paths[0])));
    const offsets = diffAngles.map(da => da < 45 ? fieldRules.leaseLineSpacing : fieldRules.takePointSpacing);

    const buffers = segments.map((seg, idx) => bufferOperator.execute(seg, offsets[idx], {unit: 'us-feet'})).filter(
      (g): g is Polygon => g instanceof Polygon
    );

    const unified = unionOperator.executeMany(buffers)!;
    this.blockPolygon = GeometryUtils.pointsToPolygon(this.vertices);

    this.fieldRulesPolygon = intersectionOperator.execute(this.blockPolygon, unified) as Polygon;
    this.drillablePolygon = differenceOperator.execute(this.blockPolygon, unified) as Polygon;

    const normal = CompassHandler.createNormalGeometry(this.centerPoint, this.azimuth);
    this.fullCrossSection = intersectionOperator.execute(this.blockPolygon, normal) as Polyline;
    this.drillableCrossSection = intersectionOperator.execute(this.drillablePolygon!, normal) as Polyline;

    const bufferGraphic = new Graphic({
      geometry: this.fieldRulesPolygon,
      symbol: {
        type: "simple-fill",
        style: "forward-diagonal",
        color: [242, 140, 40, 0.25],
        outline: {
          color: [242, 140, 40, .5],
          width: 1
        }
      }
    });

    MapController.instance.graphicsLayer.add(bufferGraphic);
  }
}
