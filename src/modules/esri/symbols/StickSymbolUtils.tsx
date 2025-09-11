import {SimpleLineSymbol} from '@arcgis/core/symbols';
import Color from "@arcgis/core/Color";

export class StickSymbolUtils {
  static building(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#00000066'),
      width: "2px",
      style: "short-dash"
    });
  }

  static normal(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#00000066'),
      width: "2px",
      style: "solid"
    });
  }

  static selected(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#000000ff'),
      width: "2px",
      style: "solid"
    });
  }
}
