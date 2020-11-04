import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ResourceDropdownField } from '@console/shared';
import { ServiceAccountModel } from '@console/internal/models';
import { RootState } from '@console/internal/redux';
import { getActiveNamespace } from '@console/internal/reducers/ui';

interface ServiceAccountDropdownProps {
  name: string;
}

interface StateProps {
  namespace: string;
}

const ServiceAccountDropdown: React.FC<ServiceAccountDropdownProps & StateProps> = ({
  name,
  namespace,
}) => {
  const { t } = useTranslation();
  const autocompleteFilter = (strText, item): boolean => fuzzy(strText, item?.props?.name);
  const resources = [
    {
      isList: true,
      kind: ServiceAccountModel.kind,
      namespace,
      prop: ServiceAccountModel.id,
      optional: true,
    },
  ];
  return (
    <ResourceDropdownField
      name={name}
      label={t('knative-plugin~Service Account Name')}
      resources={resources}
      dataSelector={['metadata', 'name']}
      placeholder={t('knative-plugin~Select a Service Account Name')}
      autocompleteFilter={autocompleteFilter}
      helpText={t('knative-plugin~The name of Service Account use to run this')}
      fullWidth
      showBadge
    />
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  namespace: getActiveNamespace(state),
});

export default connect<StateProps, null, ServiceAccountDropdownProps>(mapStateToProps)(
  ServiceAccountDropdown,
);
