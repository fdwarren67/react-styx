import {BlockModel} from "../models/BlockModel.tsx";
import {FieldRulesModel} from "../models/FieldRulesModel.tsx";
import {GeometryUtils} from "./GeometryUtils.tsx";
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js"
import * as unionOperator from "@arcgis/core/geometry/operators/unionOperator.js"
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator.js"
import * as differenceOperator from "@arcgis/core/geometry/operators/differenceOperator.js"
import {Polygon, Polyline} from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import {MapController} from "../controllers/MapController.tsx";
import {CompassHandler} from "../handlers/CompassHandler.tsx";
import {SimpleLineSymbol} from "@arcgis/core/symbols";
import Color from "@arcgis/core/Color";

export class BlockUtils {

  static justifySticks(block: BlockModel, fieldRules: FieldRulesModel): void {
    const segments = GeometryUtils.verticesToSegments(block.vertices);
    const diffAngles = segments.map(s => GeometryUtils.diffAngle(block.azimuth, GeometryUtils.convertPathToAzimuth(s.paths[0])));
    const offsets = diffAngles.map(da => da < 45 ? fieldRules.leaseLineSpacing : fieldRules.takePointSpacing);

    const buffers = segments.map((seg, idx) => bufferOperator.execute(seg, offsets[idx], {unit: 'us-feet'})).filter(
      (g): g is Polygon => g instanceof Polygon
    );

    const unified = unionOperator.executeMany(buffers);
    const blockPolygon = GeometryUtils.pointsToPolygon(block.vertices);

    const fieldRulesPolygon = intersectionOperator.execute(blockPolygon, unified!);
    const drillablePolygon = differenceOperator.execute(blockPolygon, unified!);

    const normal = CompassHandler.createNormalGeometry(block.centerPoint, block.azimuth);
    const crossSection = intersectionOperator.execute(drillablePolygon!, normal);
    const intervals = GeometryUtils.polylineToPoints((crossSection as Polyline)!);
    const points = GeometryUtils.spacedPoints(intervals[0], intervals[1], 4);

    const extensions = points.map(p => CompassHandler.createLineGeometry(p, block.azimuth, 15000));

    const adjustedDrillable = bufferOperator.execute(drillablePolygon!, 5, {unit: 'us-feet'});
    const sticks = intersectionOperator.executeMany(extensions, adjustedDrillable!);
    sticks.forEach(p => {
      const graphic = new Graphic({
        geometry: p,
        symbol: new SimpleLineSymbol({
          color: new Color('#000000ff'),
          width: "2px",
          style: "solid"
        })
      });

      MapController.instance.graphicsLayer.add(graphic);
    });

    const bufferGraphic = new Graphic({
      geometry: fieldRulesPolygon,
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


    // const crossSectionGraphic = new Graphic({
    //   geometry: crossSection,
    //   symbol: new SimpleLineSymbol({
    //     color: new Color('#0000ffff'),
    //     width: "2px",
    //     style: "solid"
    //   })
    // });
    //
    // MapController.instance.graphicsLayer.add(crossSectionGraphic);
  }
}
