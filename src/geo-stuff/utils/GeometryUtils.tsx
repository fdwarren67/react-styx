import {Geometry, Point, Polygon, Polyline} from '@arcgis/core/geometry';
import Transformation from '@arcgis/core/geometry/operators/support/Transformation';
import * as transOp from "@arcgis/core/geometry/operators/affineTransformOperator.js";
import {GeometryUnion} from '@arcgis/core/unionTypes';

export class GeometryUtils {
  static degrees(pt1: Point, pt2: Point): number {
    return GeometryUtils.convertPathToDegrees([[pt1.x, pt1.y], [pt2.x, pt2.y]]);
  }

  static convertPathToDegrees(path: number[][]): number {
    const dy = path[1][1] - path[0][1];
    const dx = path[1][0] - path[0][0];

    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  static azimuth(pt1: Point, pt2: Point) {
    return GeometryUtils.azimuthFromDegrees(GeometryUtils.degrees(pt1, pt2));
  }

  static convertPathToAzimuth(path: number[][]) {
    return GeometryUtils.azimuthFromDegrees(GeometryUtils.convertPathToDegrees(path));
  }

  static azimuthFromDegrees(degrees: number) {
    let a2 = degrees - 90;
    while (a2 < -180) {
      a2 += 360;
    }

    return -Math.round(a2 * 1000) / 1000;
  }

  static azimuthToRadians(azimuth: number) {
    let a2 = 90 - azimuth ;
    while (a2 < -180) {
      a2 += 360;
    }
    return -Math.round((a2 / 180) * Math.PI * 1000) / 1000;
  }

  static radians(pt1: Point, pt2: Point): number {
    return GeometryUtils.convertPathToRadians([[pt1.x, pt1.y], [pt2.x, pt2.y]]);
  }

  static convertPathToRadians(path: number[][]): number {
    const dy = path[1][1] - path[0][1];
    const dx = path[1][0] - path[0][0];

    return Math.atan2(dy, dx);
  }

  static radians2(a: number[], b: number[]): number {
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  }

  static distance(a: number[], b: number[]) {
    return Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
  }

  static rotate(geometry: Geometry, point: Point, degrees: number): GeometryUnion {
    const transform = new Transformation();
    transform.rotate(degrees, point.x, point.y);

    return transOp.execute(geometry, transform);
  }

  static polylineToPoints(line: Polyline): Point[] {
    const result: Point[] = [];

    line.paths[0].forEach(p => {
      result.push(new Point({
        x: p[0],
        y: p[1],
        spatialReference: line.spatialReference
      }))
    });

    return result;
  }

  static spacedPoints(pointA: Point, pointB: Point, count: number): Point[] {
      const result: Point[] = [];
      const diffX = pointA.x - pointB.x;
      const diffY = pointA.y - pointB.y;

      const incX = diffX / (count - 1);
      const incY = diffY / (count - 1);

      for (let i = 0; i < count; i++) {
        result.push(new Point({
          x: pointA.x - incX * i,
          y: pointA.y - incY * i,
          spatialReference: pointA.spatialReference
        }));
      }

      return result;
  }

  static verticesToSegments(vertices: Point[]): Polyline[] {
    const segments: Polyline[] = [];

    for (let i = 0; i < vertices.length; i++) {
      const curr = vertices[i];
      const next = vertices[(i + 1) % vertices.length];

      const segment = new Polyline({
        paths: [[[curr.x, curr.y], [next.x, next.y]]],
        spatialReference: vertices[0].spatialReference
      });

      segments.push(segment);
    }

    return segments;
  }

  static diffAngle(a: number, b: number): number {
    return 90 - Math.abs(Math.abs(Math.abs(a % 180) - Math.abs(b % 180)) - 90);
  }

  static pointsToPolygon(points: Point[]): Polygon {
    return new Polygon({
      rings: [points.map(pt => [pt.x, pt.y])],
      spatialReference: points[0].spatialReference
    });
  }

  static centerPoint(points: Point[]): Point {
      const total = points.reduce(
        (acc, pt) => {
          acc.x += pt.x;
          acc.y += pt.y;
          return acc;
        },
        { x: 0, y: 0 }
      );

      return new Point({
        x: total.x / points.length,
        y: total.y / points.length,
        spatialReference: points[0].spatialReference
      });
  }

  static offsetPoint(orig: Point, offsetX: number, offsetY: number): Point {
    return new Point({
      x: orig.x + offsetX,
      y: orig.y - offsetY,
      spatialReference: orig.spatialReference
    });
  }

  static offsetByAzimuth(orig: Point, azimuth: number, distance: number): Point {
    const radians = GeometryUtils.azimuthToRadians(azimuth);
    const offsetX = Math.cos(radians) * distance;
    const offsetY = Math.sin(radians) * distance;

    return new Point({
      x: orig.x + offsetX,
      y: orig.y - offsetY,
      spatialReference: orig.spatialReference
    });
  }

  static offsetByRadians(orig: Point, radians: number, distance: number): Point {
    const offsetX = Math.cos(radians) * distance;
    const offsetY = Math.sin(radians) * distance;

    return new Point({
      x: orig.x + offsetX,
      y: orig.y - offsetY,
      spatialReference: orig.spatialReference
    });
  }
}
