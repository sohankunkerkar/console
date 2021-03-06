import * as React from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { ActionsMenu, ResourceIcon, CloseButton } from '@console/internal/components/utils';
import { referenceFor } from '@console/internal/module/k8s';
import { getResourceModelFromTaskKind } from '../../../../utils/pipeline-augment';
import {
  PipelineTask,
  PipelineTaskParam,
  PipelineTaskResource,
  TektonResource,
  TaskKind,
} from '../../../../types';
import { getTaskParameters, getTaskResources } from '../../resource-utils';
import { ResourceTarget, TaskErrorMap, UpdateOperationUpdateTaskData } from '../types';
import TaskSidebarParam from './TaskSidebarParam';
import TaskSidebarResource from './TaskSidebarResource';
import TaskSidebarName from './TaskSidebarName';

import './TaskSidebar.scss';

type TaskSidebarProps = {
  errorMap: TaskErrorMap;
  onRemoveTask: (taskName: string) => void;
  onUpdateTask: (data: UpdateOperationUpdateTaskData) => void;
  resourceList: TektonResource[];
  selectedPipelineTaskIndex: number;
  taskResource: TaskKind;
  onClose: () => void;
};

const TaskSidebar: React.FC<TaskSidebarProps> = (props) => {
  const {
    onRemoveTask,
    onUpdateTask,
    resourceList,
    selectedPipelineTaskIndex,
    taskResource,
    onClose,
  } = props;
  const { t } = useTranslation();
  const formikTaskReference = `formData.tasks.${selectedPipelineTaskIndex}`;
  const [taskField] = useField<PipelineTask>(formikTaskReference);

  const updateTask = (newData: Partial<UpdateOperationUpdateTaskData>) => {
    onUpdateTask({ thisPipelineTask: taskField.value, taskResource, ...newData });
  };

  const params = getTaskParameters(taskResource);
  const resources = getTaskResources(taskResource);
  const inputResources = resources.inputs;
  const outputResources = resources.outputs;

  const renderResource = (type: ResourceTarget) => (resource: TektonResource) => {
    const taskResources: PipelineTaskResource[] = taskField.value?.resources?.[type] || [];
    const thisResource = taskResources.find(
      (taskFieldResource) => taskFieldResource.name === resource.name,
    );

    return (
      <div key={resource.name} className="odc-task-sidebar__resource">
        <TaskSidebarResource
          availableResources={resourceList}
          onChange={(resourceName, selectedResource) => {
            updateTask({
              resources: {
                resourceTarget: type,
                selectedPipelineResource: selectedResource,
                taskResourceName: resourceName,
              },
            });
          }}
          taskResource={thisResource}
          resource={resource}
        />
      </div>
    );
  };

  return (
    <div className="odc-task-sidebar">
      <div className="co-sidebar-dismiss clearfix">
        <CloseButton onClick={onClose} />
      </div>
      <div className="odc-task-sidebar__header">
        <h1 className="co-m-pane__heading">
          <div className="co-m-pane__name co-resource-item">
            <ResourceIcon
              className="co-m-resource-icon--lg"
              kind={referenceFor(getResourceModelFromTaskKind(taskResource.kind))}
            />
            {taskResource.metadata.name}
          </div>
          <div className="co-actions">
            <ActionsMenu
              actions={[
                {
                  label: t('pipelines-plugin~Remove Task'),
                  callback: () => onRemoveTask(taskField.value.name),
                },
              ]}
            />
          </div>
        </h1>
      </div>
      <hr />

      <div className="odc-task-sidebar__content">
        <TaskSidebarName
          initialName={taskField.value.name}
          taskName={taskResource.metadata.name}
          onChange={(newName) => updateTask({ newName })}
        />

        {params && (
          <>
            <h2>{t('pipelines-plugin~Parameters')}</h2>
            {params.map((param) => {
              const taskParams: PipelineTaskParam[] = taskField.value?.params || [];
              const thisParam = taskParams.find(
                (taskFieldParam) => taskFieldParam.name === param.name,
              );
              return (
                <div key={param.name} className="odc-task-sidebar__param">
                  <TaskSidebarParam
                    resourceParam={param}
                    taskParam={thisParam}
                    onChange={(value) => {
                      updateTask({
                        params: {
                          newValue: value,
                          taskParamName: param.name,
                        },
                      });
                    }}
                  />
                </div>
              );
            })}
          </>
        )}

        {inputResources && (
          <>
            <h2>{t('pipelines-plugin~Input resources')}</h2>
            {inputResources.map(renderResource('inputs'))}
          </>
        )}
        {outputResources && (
          <>
            <h2>{t('pipelines-plugin~Output resources')}</h2>
            {outputResources.map(renderResource('outputs'))}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskSidebar;
