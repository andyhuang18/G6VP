import type { GraphinContextType, GraphinData, Layout } from '@antv/graphin';

export interface State {
  /** graphin */
  graph: GraphinContextType['graph'];
  layoutInstance: GraphinContextType['layout'];
  apis: GraphinContextType['layout'];
  theme: GraphinContextType['theme'];

  /** graphinsight */

  /** 当前画布渲染的数据 */
  data: GraphinData;
  /** 需要画布重置的数据 */
  source: GraphinData;
  /** 布局 */
  layout: Layout;
  /** 组件 */
  components: GIComponentConfig[];
  /** 画布是否初始化完成 */
  initialized: boolean;
  /** 图初始化组件  */
  initializer: {
    id: string;
    props: {
      GI_INITIALIZER: boolean;
      serviceId: 'GI_SERVICE_INTIAL_GRAPH' | string;
    };
  };
  /** 画布的配置,等同props.config */
  config: GIConfig;
  /** 画布所有注册的服务 */
  servives: any[];
  /** 数据加载动画 */
  isLoading: boolean;
  /** 图的上下文准备 */
  isContextReady: boolean;
  /** 数据映射函数 */
  transform: (data: any) => any;
}

export interface Props {
  /**
   * @description GISDK的ID，用于多实例管理，缺失会默认生成一个
   */
  id?: string;
  /**
   * @description 配置信息
   */
  config: GIConfig;
  /**
   * @description 资产实例
   */
  assets: {
    components: any;
    elements: any;
    layouts: any;
  };
  /** 注册的全局数据服务 */
  services: GIService[];

  children?: React.ReactChildren | JSX.Element | JSX.Element[];
}

export interface LayoutConfig {
  // 支持的布局类型，默认为 force
  type?: 'preset' | 'graphin-force' | 'force' | 'grid' | 'dagre' | 'circular' | 'concentric';
  options?: {
    [key: string]: any;
  };
}
export interface GILayoutConfig {
  id: string;
  name: string;
  props: LayoutConfig;
}

export interface GIMeta {
  id: string;
  type: string;
  default: string | number;
}

export interface GIComponentConfig {
  id: string;
  props: {
    GI_CONTAINER?: string[];
    GI_CONTAINER_INDEX?: number;
    [key: string]: any;
  };
}

export interface GINodeConfig {
  id: string;
  name: string;
  rules?: any;
  props: {
    size: number;
    color: string;
    label: string;
  };
}

export interface GIEdgeConfig {
  id: string;
  name: string;
  props: {
    color: string;
    lineWidth: number;
  };
  rules?: any;
}

export interface GIConfig {
  // 支持配置多布局，如子图布局
  // layouts?: GILayoutConfig[] | GILayoutConfig;
  layout?: GILayoutConfig;
  components?: GIComponentConfig[];
  node?: GINodeConfig;
  edge?: GIEdgeConfig;
  /** 支持多元素组合 */
  nodes?: GINodeConfig[];
  edges?: GIEdgeConfig[];
}

interface GINodeData {
  id: string;
}

interface GIEdgeData {
  source: string;
  target: string;
}

export interface GIServiceResponseData {
  nodes: GINodeData[];
  edges: GIEdgeData[];
}

export interface GIServiceResponseDetailData {
  id?: string;
  source?: string;
  target?: string;
}

export interface GIService {
  /** 获取初始化接口，获取初始图数据 */
  id: string;
  service: (params?: any) => Promise<GIServiceResponseData>;
}
