import {Point, Polyline} from "@arcgis/core/geometry";
import Graphic from "@arcgis/core/Graphic";
import Circle from "@arcgis/core/geometry/Circle";
import {PictureMarkerSymbol, SimpleLineSymbol} from "@arcgis/core/symbols";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import {GraphicRoles} from "../utils/Constants.tsx";
import {EmptyViewModel} from "../view-models/EmptyViewModel.tsx";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import {AzimuthViewModel} from "../view-models/AzimuthViewModel.tsx";

export class CompassHandler {
  graphicsLayer: GraphicsLayer | undefined;
  centerPoint: Point;
  azimuth: number;
  azimuthGraphic: Graphic;
  normalGraphic: Graphic;
  innerCircleGraphic: Graphic;
  outerCircleGraphic: Graphic;
  centerArrowGraphic: Graphic;

  constructor(centerPoint: Point, azimuth: number, graphicsLayer: GraphicsLayer) {
    this.centerPoint = centerPoint;
    this.azimuth = azimuth;
    this.graphicsLayer = graphicsLayer;

    this.azimuthGraphic = CompassHandler.createAzimuth(CompassHandler.createAzimuthGeometry(centerPoint, azimuth));
    this.normalGraphic = CompassHandler.createNormal(CompassHandler.createNormalGeometry(centerPoint, azimuth));
    this.innerCircleGraphic = CompassHandler.createCircle(CompassHandler.createCircleGeometry(centerPoint, 5280 / 2));
    this.outerCircleGraphic = CompassHandler.createCircle(CompassHandler.createCircleGeometry(centerPoint, 5280));
    this.centerArrowGraphic = CompassHandler.createCenterArrow(this.centerPoint, this.azimuth);
    this.graphicsLayer.addMany([this.azimuthGraphic, this.normalGraphic, this.innerCircleGraphic, this.outerCircleGraphic, this.centerArrowGraphic]);
  }

  hide(): void {
    this.graphicsLayer!.removeMany([this.azimuthGraphic, this.normalGraphic, this.innerCircleGraphic, this.outerCircleGraphic, this.centerArrowGraphic]);
  }

  updateFromModel(model: AzimuthViewModel): void {
    this.centerPoint = model.centerPoint;
    this.azimuth = model.azimuth;
    this.updateGraphics();
    this.hide();
    this.graphicsLayer!.addMany([ this.azimuthGraphic, this.normalGraphic, this.innerCircleGraphic, this.outerCircleGraphic, this.centerArrowGraphic]);
  }

  updateGraphics(): void {
    this.innerCircleGraphic.geometry = CompassHandler.createCircleGeometry(this.centerPoint, 5280 / 2);
    this.azimuthGraphic.geometry = CompassHandler.createAzimuthGeometry(this.centerPoint, this.azimuth);
    this.normalGraphic.geometry = CompassHandler.createNormalGeometry(this.centerPoint, this.azimuth);
    this.innerCircleGraphic.geometry = CompassHandler.createCircleGeometry(this.centerPoint, 5280 / 2);
    this.outerCircleGraphic.geometry = CompassHandler.createCircleGeometry(this.centerPoint, 5280);

    this.graphicsLayer!.remove(this.centerArrowGraphic);
    this.centerArrowGraphic = CompassHandler.createCenterArrow(this.centerPoint, this.azimuth);
    this.graphicsLayer!.add(this.centerArrowGraphic);
  }

  static createAzimuthGeometry(centerPoint: Point, azimuth: number): Polyline {
    return CompassHandler.createLineGeometry(centerPoint, azimuth, 25000);
  }

  static createNormalGeometry(centerPoint: Point, azimuth: number): Polyline {
    return CompassHandler.createLineGeometry(centerPoint, azimuth + 90, 15000);
  }

  static createLineGeometry(centerPoint: Point, azimuth: number, distance: number): Polyline {
    const a1 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth, distance);
    const a2 = GeometryUtils.offsetByAzimuth(centerPoint, azimuth - 180, distance);

    return new Polyline({
      paths: [[[a1.x, a1.y], [a2.x, a2.y]]],
      spatialReference: centerPoint.spatialReference
    });
  }

  static createCircleGeometry(centerPoint: Point, radiusFeet: number): Circle {
    return new Circle({
      center: centerPoint,
      radius: radiusFeet,
      radiusUnit: 'feet'
    });
  }

  static createCircle(circle: Circle): Graphic {
    return new Graphic({
      geometry: circle,
      symbol: new SimpleLineSymbol({
        color: "#ff000011",
        width: "2px",
        style: "long-dash"
      }),
      attributes: {
        model: new EmptyViewModel(),
        role: GraphicRoles.CompassCircle,
        index: 0
      }
    })
  }

  static createAzimuth(line: Polyline): Graphic {
      return new Graphic({
        geometry: line,
        symbol: new SimpleLineSymbol({
          color: "#ff000022",
          width: "3px",
          style: "long-dash"
        }),
        attributes: {
          model: new EmptyViewModel(),
          role: GraphicRoles.CompassAzimuth,
          index: 0
        }
      });
  }

  static createNormal(line: Polyline): Graphic {
    return new Graphic({
      geometry: line,
      symbol: new SimpleLineSymbol({
        color: "#ff000022",
        width: "2px",
        style: "short-dash"
      }),
      attributes: {
        model: new EmptyViewModel(),
        role: GraphicRoles.CompassNormal,
        index: 0
      }
    });
  }

  static createCenterArrow(point: Point, angle: number): Graphic {
    return new Graphic({
      geometry: point,
      symbol: new PictureMarkerSymbol({
        url: import.meta.env.BASE_URL + "up-arrow.png",
        height: '100px',
        width: '50px',
        angle: angle
      }),
      attributes: {
        model: new EmptyViewModel(),
        role: GraphicRoles.CompassCenterArrow,
        index: 0
      }
    });
  }
}
