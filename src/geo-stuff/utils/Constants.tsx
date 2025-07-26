export enum ModelRoles {
  None,
  Line,
  Polygon,
  AnchorPoint,
  EndPoint,
  Vertex,
  Edge,
  Boundary,
  CompassCircle,
  CompassAzimuth,
  CompassNormal
}

export class ModelTypes {
  public static readonly Empty = 'empty';
  public static readonly Line = 'line';
  public static readonly Rect = 'rect';
  public static readonly Polygon = 'polygon';
}

export class BuilderTypes {
  public static readonly LineBuilder = 'LineBuilder';
  public static readonly RectBuilder = 'RectBuilder';
  public static readonly PolygonBuilder = 'PolygonBuilder';
  public static readonly RectTransformer = 'RectTransformer';
  public static readonly RectResizer = 'RectResizer';
}

export enum MapModes {
  None,
  DrawLine,
  DrawRect,
  DrawPolygon,
  TransformRect,
  ResizeRect
}

export class Constants {
  public static readonly graphicsLayerName = 'Frank';
}
