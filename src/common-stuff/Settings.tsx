import {FieldRulesModel} from "../geo-stuff/models/FieldRulesModel.tsx";

export class Settings {
  fieldRules: FieldRulesModel = new FieldRulesModel();

  static readonly instance: Settings = new Settings();

  private constructor() {
  }
}
