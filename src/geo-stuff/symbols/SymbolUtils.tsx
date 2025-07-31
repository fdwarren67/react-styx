import {Symbol} from '@arcgis/core/symbols';
import {ModelRoles} from "../utils/Constants.tsx";
import {BlockSymbolUtils} from "./BlockSymbolUtils.tsx";
import {StickSymbolUtils} from "./StickSymbolUtils.tsx";

export class SymbolUtils {
  static building(role: ModelRoles): Symbol {
    switch (role) {
      case ModelRoles.Block:
        return BlockSymbolUtils.building();
      case ModelRoles.Stick:
        return StickSymbolUtils.building();
    }

    return StickSymbolUtils.building();
  }

  static normal(role: ModelRoles): Symbol {
    switch (role) {
      case ModelRoles.Block:
        return BlockSymbolUtils.normal();
      case ModelRoles.Stick:
        return StickSymbolUtils.normal();
    }

    return StickSymbolUtils.normal();
  }

  static selected(role: ModelRoles): Symbol {
    switch (role) {
      case ModelRoles.Block:
        return BlockSymbolUtils.selected();
      case ModelRoles.Stick:
        return StickSymbolUtils.selected();
    }

    return StickSymbolUtils.selected();
  }
}
