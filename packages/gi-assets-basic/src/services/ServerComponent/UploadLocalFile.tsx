import React, { useState } from 'react';
import { Updater } from 'use-immer';
import { IState, IInputData } from './type';
import { Alert, Button, Row, Upload } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { IUserEdge, IUserNode } from '@antv/graphin';
import { getOptions } from './utils';
import xlsx2js from 'xlsx2js';

interface IProps {
  state: IState;
  updateState: Updater<IState>;
}

const { Dragger } = Upload;

const UploadLocalFile: React.FC<IProps> = props => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
  const { state, updateState } = props;

  const draggerProps = {
    name: 'file',
    defaultFileList: state.inputData,
    onRemove: file => {
      const renderData = state.inputData.filter(d => d.uid !== file.uid);
      if (renderData.length === 0) {
        setButtonDisabled(true);
      }
      updateState(draft => {
        draft.inputData = renderData;
      });
      mergeData(renderData);
    },
    customRequest: async options => {
      const { file, onSuccess } = options;
      let fileData;

      setButtonDisabled(false);

      if (!file) {
        return false;
      } else if (/\.(xls|xlsx|csv)$/.test(file.name.toLowerCase())) {
        const data = await xlsx2js(file);

        const firstData = data[0];
        const isEdge = firstData.source && firstData.target;
        fileData = isEdge
          ? {
              nodes: [],
              edges: data,
            }
          : {
              nodes: data,
              edges: [],
            };

        const renderData: IInputData[] = [
          ...state.inputData,
          {
            uid: file.uid,
            name: file.name,
            data: fileData,
            transfunc: state.transfunc,
            enable: true,
          },
        ];
        updateState(draft => {
          draft.inputData = renderData;
        });
        onSuccess('Ok');
        mergeData(renderData);
      } else if (/\.(json)$/.test(file.name.toLowerCase())) {
        const reader = new FileReader();
        reader.readAsText(file, 'utf-8');
        reader.onload = fileReader => {
          fileData = JSON.parse(fileReader.target!.result as string);

          const renderData = [
            ...state.inputData,
            {
              uid: file.uid,
              name: file.name,
              data: fileData,
              transfunc: state.transfunc,
              enable: true,
            },
          ];
          updateState(draft => {
            draft.inputData = renderData;
          })
          onSuccess('Ok');
          mergeData(renderData);
        };
      } else {
        return false;
      }
    },
  };

  const mergeData = (renderData: IInputData[] = state.inputData) => {
    let nodes: IUserNode[] = [];
    let edges: IUserEdge[] = [];
    renderData.map(d => {
      nodes = [...nodes, ...d.data.nodes];
      edges = [...edges, ...d.data.edges];
    });
    updateState(draft => {
      draft.data = { nodes, edges };
      draft.transData = eval(state.transfunc)({ nodes, edges });
    });
  };

  const checkData = () => {
    updateState(draft => {
      draft.activeKey++;
      console.log("data:", state.data)
      draft.transColumns = getOptions(state.data);
      draft.tableData = state.transData?.nodes.map((d, i) => {
        return {
          ...d,
          key: i,
        };
      });
    });
  };

  return (
    <div className="upload-panel" style={{ margin: '10px 0px 0px 0px' }}>
      <Alert
        message="如果暂时没有数据，可以切换上方导航栏到「示例数据」进行体验"
        type="info"
        showIcon
        closable
        style={{ marginBottom: '12px' }}
      />
      <h4 style={{ marginBottom: 0 }}>已传数据</h4>

      <div className="upload-panel-section">
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <FileTextOutlined />
          </p>
          <p>点击或将数据文件拖拽到这里上传，支持 JSON，CSV，XLS，XLSX格式</p>
          <p>CSV/XLS/XLSX文件规范：</p>
          <p>分别上传点表和边表，点表：必须要有 id 字段，边表：必须要有 source 和 target 字段</p>
          <p>JSON 文件规范：</p>
          <p>点表和边表放在同一个 JSON 文件中上传，nodes 表示点的集合，edges 表示边的集合，其属性字段的规范同上</p>
        </Dragger>
      </div>
      <Row style={{ padding: '30px 0px 10px 0px', justifyContent: 'center' }}>
        <Button type="primary" disabled={buttonDisabled} shape="round" onClick={checkData}>
          进入下一步
        </Button>
      </Row>
    </div>
  );
};

export default UploadLocalFile;
