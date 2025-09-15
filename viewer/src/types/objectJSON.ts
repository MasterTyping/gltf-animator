export interface GeometryJSON {
  name?: string;
  userData?: any;

  [key: string]: any;
}

export interface MaterialJSON {
  color?: string | number;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  side?: number;
  alphaTest?: number;
  depthTest?: boolean;
  depthWrite?: boolean;
  name?: string;
  userData?: any;

  [key: string]: any;
}

export interface ObjectJSON {
  uuid: string;
  name: string;
  visible: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parent: string | null; // uuid | null
  userData: any;
  children: string[]; // uuid[]
  geometry?: GeometryJSON;
  material?: MaterialJSON;
  url?: string;
  key?: number;
  isTemp?: boolean; // addObject 전 temp 단계에서 true로 존재하다가 addObject 액션 안에서 해당 key delete
  objectLoaded?: boolean; //  씬에 Object3D 렌더링 여부
}

export interface ObjectJSONs {
  [uuid: string]: ObjectJSON;
}
