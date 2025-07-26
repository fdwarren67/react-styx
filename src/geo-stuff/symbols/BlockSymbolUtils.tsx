import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {SimpleLineSymbol} from "@arcgis/core/symbols";

export class BlockSymbolUtils {
  public static building(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff000066'),
        width: "2px",
        style: "short-dash"
      })
    });
  }

  public static normal(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff000066'),
        width: "2px",
        style: "solid"
      })
    });
  }

  public static selected(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff0000ff'),
        width: "2px",
        style: "solid"
      })
    });
  }

  public static thickSegment(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#ff000066'),
      width: "4px",
      style: "solid"
    });
  }

}
