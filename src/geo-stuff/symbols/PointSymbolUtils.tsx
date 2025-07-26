import Color from "@arcgis/core/Color";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export class PointSymbolUtils {
  public static redCircle(size: number = 5): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'circle',
      size: size + 'px',
      color: new Color('#ff000088'),
      outline: {
        color: new Color('#ff000088'),
        width: 2
      }
    });
  }

  public static blackCircle(size: number = 5): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'circle',
      size: size + 'px',
      color: new Color('#00000088'),
      outline: {
        color: new Color('#00000088'),
        width: 2
      }
    });
  }

  public static redSquare(size: number = 5): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'square',
      size: size + 'px',
      color: new Color('#ff000055'),
      outline: {
        color: new Color('#ff000055'),
        width: 2
      }
    });
  }

  public static redX(): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'x',
      size: '7px',
      color: new Color('#ff000055')
    });
  }
}
