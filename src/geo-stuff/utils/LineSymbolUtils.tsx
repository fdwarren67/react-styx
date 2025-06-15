import {SimpleLineSymbol} from '@arcgis/core/symbols';
import Color from "@arcgis/core/Color";

export class LineSymbolUtils {
  public static redDashes(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: "red",
      width: "2px",
      style: "long-dash"
    });
  }

  public static greenDashes(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: "green",
      width: "1px",
      style: "long-dash"
    });
  }

  public static redSolid(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#ff000099'),
      width: "2px",
      style: "solid"
    });
  }

  public static blackSolid(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#000000cc'),
      width: "2px",
      style: "solid"
    });
  }
}
