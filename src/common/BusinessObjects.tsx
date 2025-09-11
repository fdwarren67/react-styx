import {Polygon, Polyline} from "@arcgis/core/geometry";

export class County {
  countyCode: string | undefined;
  countyName: string | undefined;
  stateAbbr: string | undefined;
  api3digit: string | undefined;
  fips3digit: string | undefined;
  fips5digit: string | undefined;
  nad27Epsg: string | undefined;
  nad83Epsg: string | undefined;
  utmZone: string | undefined;
  centroidLatitude: number | undefined;
  centroidLongitude: number | undefined;

  constructor(init?: Partial<County>) {
    Object.assign(this, init);
  }
}

export class State {
  stateAbbr: string | undefined;
  stateName: string | undefined;
  apiCode: string | undefined;
  fipsCode: string | undefined;
  centroidLatitude: number | undefined;
  centroidLongitude: number | undefined;

  constructor(init?: Partial<State>) {
    Object.assign(this, init);
  }
}

export class StatePlane {
  epsgCode: string | undefined;
  fipsZoneCode: string | undefined;
  datum: string | undefined;
  statePlaneName: string | undefined;

  constructor(init?: Partial<StatePlane>) {
    Object.assign(this, init);
  }
}

export class Block {
  blockId: number | undefined;
  blockGuid: string | undefined;
  blockName: string | undefined;
  developmentAreaId: number | undefined;
  developmentAreaName: string | undefined;
  overrideCountyCode: string | undefined;
  referenceAzimuth: number | undefined;
  blockGeometry: Polygon | undefined;

  constructor(init?: Partial<Block>) {
    Object.assign(this, init);
  }
}

export class BlockFormation {
  blockId: number | undefined;
  blockName: string | undefined;
  formationId: number | undefined;
  formationName: string | undefined;
  fieldRulesGeometry: Polygon | undefined;
  topSstvd: number | undefined;

  constructor(init?: Partial<BlockFormation>) {
    Object.assign(this, init);
  }
}

export class BusinessUnit {
  businessUnitId: number | undefined;
  businessUnitGuid: string | undefined;
  businessUnitName: string | undefined;

  constructor(init?: Partial<BusinessUnit>) {
    Object.assign(this, init);
  }
}

export class DevelopmentArea {
  developmentAreaId: number | undefined;
  developmentAreaGuid: string | undefined;
  developmentAreaName: string | undefined;
  businessUnitId: number | undefined;
  businessUnitName: string | undefined;
  countyCode: string | undefined;
  countyName: string | undefined;
  stateAbbr: string | undefined;
  datum: string | undefined;
  epsgCode: string | undefined;

  constructor(init?: Partial<DevelopmentArea>) {
    Object.assign(this, init);
  }
}

export class DevelopmentAreaFormation {
  developmentAreaId: number | undefined;
  formationId: number | undefined;
  formationName: string | undefined;
  topSstvd: number | undefined;
  regulatoryFieldId: number | undefined;

  constructor(init?: Partial<DevelopmentAreaFormation>) {
    Object.assign(this, init);
  }
}

export class Lateral {
  lateralId: number | undefined;
  lateralGuid: string | undefined;
  lateralName: string | undefined;
  blockId: number | undefined;
  azimuth: number | undefined;
  lateralLength: number | undefined;
  formationId: number | undefined;
  sstvd: number | undefined;
  lateralGeometry: Polyline | undefined;

  constructor(init?: Partial<Lateral>) {
    Object.assign(this, init);
  }
}
export class Formation {
  formationId: number | undefined;
  formationGuid: string | undefined;
  formationName: string | undefined;
  parentFormationId: number | undefined;

  constructor(init?: Partial<Formation>) {
    Object.assign(this, init);
  }
}

export class RegulatoryField {
  regulatoryFieldId: number | undefined;
  regulatoryFieldGuid: string | undefined;
  regulatoryFieldName: string | undefined;
  takePointSpacing: number | undefined;
  leaseLineSpacing: number | undefined;
  wellSpacing: number | undefined;

  constructor(init?: Partial<RegulatoryField>) {
    Object.assign(this, init);
  }
}
