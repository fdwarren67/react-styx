export enum ModelRoles {
  None,
  Stick,
  Block,
  WorkingArea
}

export enum GraphicRoles {
  Polygon,
  AnchorPoint,
  EndPoint,
  Vertex,
  Edge,
  CompassCircle,
  CompassAzimuth,
  CompassNormal,
  CompassCenterArrow,
  LineLabel
}

export class ModelTypes {
  static readonly Empty = 'empty';
  static readonly Line = 'line';
  static readonly Rect = 'rect';
  static readonly Polygon = 'polygon';
}

export class BuilderTypes {
  static readonly LineBuilder = 'LineBuilder';
  static readonly RectBuilder = 'RectBuilder';
  static readonly PolygonBuilder = 'PolygonBuilder';
  static readonly RectTransformer = 'RectTransformer';
  static readonly RectResizer = 'RectResizer';
}

export enum MapModes {
  None,
  DrawStick,
  DrawBlockRect,
  DrawBlockPolygon,
  TransformBlock,
  ResizeBlock
}

export class Constants {
  static readonly graphicsLayerName = 'Frank';
}
