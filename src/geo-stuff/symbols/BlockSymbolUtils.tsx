import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {SimpleLineSymbol} from "@arcgis/core/symbols";

export class BlockSymbolUtils {
  static building(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff000066'),
        width: "2px",
        style: "short-dash"
      })
    });
  }

  static normal(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff000066'),
        width: "2px",
        style: "solid"
      })
    });
  }

  static selected(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: new SimpleLineSymbol({
        color: new Color('#ff0000cc'),
        width: "3px",
        style: "solid"
      })
    });
  }

  static thickSegment(): SimpleLineSymbol {
    return new SimpleLineSymbol({
      color: new Color('#ff0000cc'),
      width: "8px",
      style: "solid"
    });
  }

}
