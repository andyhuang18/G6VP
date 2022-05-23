import { Tabs } from 'antd';
import * as React from 'react';
import { useImmer } from 'use-immer';
import DataModeCard from '../../components/DataModeCard';
import BaseNavbar from '../../components/Navbar/BaseNavbar';
import { getSearchParams } from '../../components/utils';
import { IS_LOCAL_ENV } from '../../services/const';
import setDefaultDemo from '../X-Studio';
import CreatePanel from './Create';
import './index.less';
import ProjectList from './projectList';
import SaveList from './SaveList';

setDefaultDemo();

interface WorkspaceProps {}
const { TabPane } = Tabs;
const LIST_OPTIONS: { id: 'case' | 'project' | 'save'; name: string }[] = IS_LOCAL_ENV
  ? [
      {
        id: 'case',
        name: '行业案例',
      },
      {
        id: 'project',
        name: '我的项目',
      },
      {
        id: 'save',
        name: '我的保存',
      },
    ]
  : [
      {
        id: 'project',
        name: '我的项目',
      },
    ];

const Workspace: React.FunctionComponent<WorkspaceProps> = props => {
  const { searchParams } = getSearchParams(location);
  const type = searchParams.get('type') || 'case';
  const [state, updateState] = useImmer({
    visible: false,
    activeKey: type,
  });

  const handleClose = () => {
    updateState(draft => {
      draft.visible = false;
    });
  };

  const handleOpen = () => {
    updateState(draft => {
      draft.visible = true;
    });
  };

  const { visible, activeKey } = state;
  const handleChange = val => {
    console.log('activeKey', val);
    try {
      const { searchParams } = getSearchParams(location);
      const type = searchParams.get('type') || 'case';
      const newHref = window.location.href.replace(type, val);
      window.location.href = newHref;
      updateState(draft => {
        draft.activeKey = val;
      });
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
      <div className="workspace">
        <BaseNavbar rightContentExtra={<DataModeCard />}></BaseNavbar>
        <div
          style={{
            overflow: 'scroll',
            padding: '24px 48px',
            height: 'calc(100vh - 64px)',
            background: '#fafafa',
          }}
        >
          <Tabs
            tabPosition="left"
            style={{
              background: '#fff',
              height: '100%',
              padding: '24px 0px',
              overflow: 'auto',
            }}
            activeKey={activeKey}
            onChange={handleChange}
          >
            {LIST_OPTIONS.map(c => {
              return (
                <TabPane tab={c.name} key={c.id}>
                  {(c.id === 'case' || c.id === 'project') && <ProjectList type={c.id} onCreate={handleOpen} />}
                  {c.id === 'save' && <SaveList type={c.id}></SaveList>}
                </TabPane>
              );
            })}
          </Tabs>
        </div>
      </div>
      <CreatePanel visible={visible} handleClose={handleClose} />
    </>
  );
};

export default Workspace;
