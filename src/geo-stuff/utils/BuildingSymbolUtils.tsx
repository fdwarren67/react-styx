import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {SimpleLineSymbol} from "@arcgis/core/symbols";

export class BuildingSymbolUtils {
  public static fillSymbol(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000011'),
      outline: BuildingSymbolUtils.lineSymbol()
    });
  }

  public static lineSymbol(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#ff000055'),
      width: "2px",
      style: "short-dash"
    });
  }

  public static thickLineSymbol(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#ff000088'),
      width: "6px",
      style: "solid"
    });
  }
}
