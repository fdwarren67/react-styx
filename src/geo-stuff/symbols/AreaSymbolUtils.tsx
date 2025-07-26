import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {SimpleLineSymbol} from "@arcgis/core/symbols";

export class AreaSymbolUtils {
  public static building(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#00aa0009'),
      outline: new SimpleLineSymbol({
        color: new Color('#00aa0066'),
        width: "2px",
        style: "long-dash"
      })
    });
  }

  public static normal(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#00aa0000'),
      outline: new SimpleLineSymbol({
        color: new Color('#00aa00ff'),
        width: "2px",
        style: "short-dash"
      })
    });
  }

  public static selected(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#00aa0009'),
      outline: new SimpleLineSymbol({
        color: new Color('#00aa00ff'),
        width: "2px",
        style: "long-dash"
      })
    });
  }
}
