import Graphin from '@antv/graphin';
import { Button, Col, Form, Input, Row, Select, Statistic } from 'antd';
import * as React from 'react';
import { useImmer } from 'use-immer';
import { GraphSchemaData, utils } from '../../index';
import CollapseCard from '../CollapseCard';
import type { GraphDBConfig } from './index';
import { getEngineForm, setEngineForm } from './utils';

const { getSchemaGraph } = utils;

type SchemaGraphProps = Pick<
  GraphDBConfig,
  'engineId' | 'queryGraphSchema' | 'giSiteContext' | 'querySubGraphList' | 'queryVertexLabelCount' | 'updateGISite'
>;

const { Option } = Select;

const SchemaGraph: React.FunctionComponent<SchemaGraphProps> = props => {
  const {
    queryGraphSchema,
    querySubGraphList,
    queryVertexLabelCount = () => {
      return {
        nodeCount: '-',
        edgeCount: '-',
      };
    },
    engineId,
    updateGISite,
    //@ts-ignore
    token,
  } = props;

  const [form] = Form.useForm();

  const { CURRENT_SUBGRAPH } = getEngineForm(engineId);

  const [state, updateState] = useImmer<{
    schemaData: GraphSchemaData;
    count: {
      nodes: number | string;
      edges: number | string;
    };
    subGraphList: any[];
    subGraphName: string;
    defaultLabelField: string;
    selectedSubgraph: any;
  }>({
    schemaData: { nodes: [], edges: [] },

    count: {
      nodes: '-',
      edges: '-',
    },
    defaultLabelField: 'name',
    subGraphList: [],
    subGraphName: CURRENT_SUBGRAPH,
    selectedSubgraph: undefined,
  });
  const { schemaData, count, subGraphList, subGraphName, defaultLabelField } = state;

  const getSubGraphList = async () => {
    const result = await querySubGraphList();
    if (!result) {
      return;
    }
    const Match = result.find(item => item.value === subGraphName) || result[0];
    const SUB_GRAPH_NAME = Match.value;

    updateState(draft => {
      draft.subGraphList = result;
      draft.subGraphName = SUB_GRAPH_NAME;
    });
  };

  const handleChange = async value => {
    updateState(draft => {
      draft.subGraphName = value;
    });
  };

  const handleChangeSubGraph = async () => {
    // 切换子图后，同步查询 Schema
    utils.setServerEngineContext({
      CURRENT_SUBGRAPH: subGraphName,
    });
    setEngineForm(engineId, {
      CURRENT_SUBGRAPH: subGraphName,
    });
    const schemaData = (await queryGraphSchema()) as GraphSchemaData;
    const counts = await queryVertexLabelCount();

    updateState(draft => {
      if (schemaData.nodes && schemaData.edges) {
        draft.schemaData = schemaData;
      }
      draft.count = {
        nodes: counts.nodeCount,
        edges: counts.edgeCount,
      };
    });
  };

  React.useEffect(() => {
    getSubGraphList();
  }, [token]);

  React.useEffect(() => {
    handleChangeSubGraph();
  }, [subGraphName]);

  const handleSubmit = () => {
    const newSchemaData = {
      ...schemaData,
      meta: {
        defaultLabelField: defaultLabelField,
      },
    };
    form.validateFields().then(values => {
      const { datasetName } = values;
      utils.setServerEngineContext({
        engineId,
        schemaData: newSchemaData,
      });
      setEngineForm(engineId, {
        engineId,
        schemaData: newSchemaData,
      });
      const engineContext = utils.getServerEngineContext();
      if (updateGISite) {
        updateGISite({
          engineId,
          schemaData: newSchemaData,
          engineContext: engineContext,
          name: datasetName,
        });
      }
    });
  };

  const defaultStyleConfig = utils.generatorStyleConfigBySchema(schemaData);
  const schemaGraph = getSchemaGraph(schemaData, defaultStyleConfig);

  const isEmpty = schemaData.nodes.length === 0;

  return (
    <CollapseCard title="选择子图">
      <Form name="subgraphForm" form={form} layout="vertical">
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <div style={{ padding: '24px' }}>
              <Form.Item
                label="选择子图"
                name="subgraph"
                rules={[
                  {
                    required: true,
                    message: '请选择子图!',
                  },
                ]}
                style={{
                  marginTop: 16,
                }}
                initialValue={subGraphName}
              >
                <Select
                  showSearch
                  placeholder="请选择要查询的子图"
                  onChange={handleChange}
                  style={{ width: '100%' }}
                  value={subGraphName}
                >
                  {subGraphList.map((d: any) => {
                    return <Option value={d.value}>{!d.description ? d.label : `${d.label}(${d.description})`}</Option>;
                  })}
                </Select>
              </Form.Item>
              <div style={{ margin: '20px 0px' }}>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Statistic title="节点规模" value={count.nodes} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="边规模" value={count.edges} />
                  </Col>
                </Row>
              </div>
              {schemaData ? (
                <Form.Item
                  label="数据名称"
                  name="datasetName"
                  rules={[
                    {
                      required: true,
                      message: '请输入数据名称!',
                    },
                  ]}
                  style={{
                    marginTop: 16,
                  }}
                >
                  <Input placeholder="请为该数据集命名" />
                </Form.Item>
              ) : (
                ''
              )}
              <Button type="primary" onClick={handleSubmit} style={{ width: '100%' }}>
                进入分析
              </Button>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} style={{ border: '2px dashed rgb(22, 101, 255)' }}>
            {isEmpty ? (
              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  height: '100%',
                  alignItems: 'center',
                }}
              >
                暂无图模型
              </div>
            ) : (
              <Graphin
                style={{ minHeight: '300px' }}
                data={schemaGraph}
                fitView
                layout={{ type: 'force2', animation: false }}
              ></Graphin>
            )}
          </Col>
        </Row>
      </Form>
    </CollapseCard>
  );
};

export default SchemaGraph;
