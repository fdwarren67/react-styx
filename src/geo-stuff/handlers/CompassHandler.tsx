import {Point, Polyline} from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import Circle from "@arcgis/core/geometry/Circle";
import {SimpleLineSymbol} from "@arcgis/core/symbols";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import {PointSymbolUtils} from "../utils/PointSymbolUtils.tsx";
import {ModelAttributes} from "../utils/ModelAttributes.tsx";
import {ModelRoles} from "../utils/Constants.tsx";
import {EmptyModel} from "../models/EmptyModel.tsx";

export class CompassHandler {
  centerPoint: Point;
  azimuth: number;
  centerGraphic: Graphic;
  azimuthGraphic: Graphic;
  normalGraphic: Graphic;
  innerCircleGraphic: Graphic;
  outerCircleGraphic: Graphic;

  constructor(centerPoint: Point, azimuth: number) {
    this.centerPoint = centerPoint;
    this.azimuth = azimuth;

    this.centerGraphic = new Graphic({
      geometry: centerPoint,
      symbol: PointSymbolUtils.redCircle()
    });

    this.azimuthGraphic = CompassHandler.createAzimuth(CompassHandler.createAzimuthGeometry(centerPoint, azimuth));
    this.normalGraphic = CompassHandler.createNormal(CompassHandler.createNormalGeometry(centerPoint, azimuth));
    this.innerCircleGraphic = CompassHandler.createCircle(CompassHandler.createCircleGeometry(centerPoint, 5280 / 2));
    this.outerCircleGraphic = CompassHandler.createCircle(CompassHandler.createCircleGeometry(centerPoint, 5280));
  }

  public updateFromVertices(vertices: Point[]): void {
    this.centerPoint = GeometryUtils.pointsToPolygon(vertices).centroid!;
    this.azimuth = GeometryUtils.convertPathToAzimuth([[vertices[0].x, vertices[0].y], [vertices[1].x, vertices[1].y]]);
    this.updateGraphics();
  }

  private updateGraphics(): void {
    this.azimuthGraphic.geometry = CompassHandler.createAzimuthGeometry(this.centerPoint, this.azimuth);
    this.normalGraphic.geometry = CompassHandler.createNormalGeometry(this.centerPoint, this.azimuth);
    this.innerCircleGraphic.geometry = CompassHandler.createCircleGeometry(this.centerPoint, 5280 / 2);
    this.outerCircleGraphic.geometry = CompassHandler.createCircleGeometry(this.centerPoint, 5280);
  }

  public static createAzimuthGeometry(centerPoint: Point, azimuth: number): Polyline {
    const a1 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth, 20000);
    const a2 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth - 180, 20000);

    return new Polyline({
      paths: [[[a1.x, a1.y], [a2.x, a2.y]]],
      spatialReference: centerPoint.spatialReference
    });
  }

  public static createNormalGeometry(centerPoint: Point, azimuth: number): Polyline {
    const a1 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth + 90, 20000);
    const a2 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth - 90, 20000);

    return new Polyline({
      paths: [[[a1.x, a1.y], [a2.x, a2.y]]],
      spatialReference: centerPoint.spatialReference
    });
  }

  public static createCircleGeometry(centerPoint: Point, radiusFeet: number): Circle {
    return new Circle({
      center: centerPoint,
      radius: radiusFeet,
      radiusUnit: 'feet'
    });
  }

  public static createCircle(circle: Circle): Graphic {
    return new Graphic({
      geometry: circle,
      symbol: new SimpleLineSymbol({
        color: "#ff000011",
        width: "2px",
        style: "long-dash"
      }),
      attributes: {
        modelAttributes: new ModelAttributes(new EmptyModel(), ModelRoles.Compass, 0)
      }
    })
  }

  public static createAzimuth(line: Polyline): Graphic {
      return new Graphic({
        geometry: line,
        symbol: new SimpleLineSymbol({
          color: "#ff000011",
          width: "3px",
          style: "long-dash"
        }),
        attributes: {
          modelAttributes: new ModelAttributes(new EmptyModel(), ModelRoles.Compass, 0)
        }
      });
  }

  public static createNormal(line: Polyline): Graphic {
    return new Graphic({
      geometry: line,
      symbol: new SimpleLineSymbol({
        color: "#ff000011",
        width: "2px",
        style: "short-dash"
      }),
      attributes: {
        modelAttributes: new ModelAttributes(new EmptyModel(), ModelRoles.Compass, 0)
      }
    });
  }
}
