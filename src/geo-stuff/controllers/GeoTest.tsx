import * as projectOperator from "@arcgis/core/geometry/operators/projectOperator";
import {Point, Polygon} from "@arcgis/core/geometry";
import {MapController} from "./MapController.tsx";
import Graphic from "@arcgis/core/Graphic";
import {PolygonModel} from "../models/PolygonModel.tsx";
import {ModelRoles} from "../utils/Constants.tsx";
import {AreaSymbolUtils} from "../symbols/AreaSymbolUtils.tsx";

export class GeoTest {
  public static test(ctx: MapController) {
    const center = projectOperator.execute(ctx.view!.center, ctx.statePlane!) as Point;
    const diff = 8000 / 2;

    const polygon: Polygon = new Polygon({
      rings: [[
        [center.x - diff, center.y + diff],
        [center.x - diff, center.y - diff],
        [center.x + diff, center.y - diff],
        [center.x + diff, center.y + diff]
      ]],
      spatialReference: ctx.statePlane
    });

    const model = new PolygonModel(polygon.rings[0].map(r => new Point({
      x: r[0],
      y: r[1],
      spatialReference: ctx.statePlane
    })));

    ctx.graphicsLayer.add(new Graphic({
      geometry: polygon,
      symbol: AreaSymbolUtils.normal(),
      attributes: {
        model: model,
        role: ModelRoles.Boundary,
        index: 0
      }
    }));

    // ctx.graphicsLayer.addMany(AzimuthUtils.createGraphics(center, 0));
  }
}
