import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import containerCreate from '../../modules/containers/actions/containerCreate';
import containersFetch from '../../modules/containers/actions/containersFetch';
import {pickContainer} from '../../actions';
import {ButtonAtRightTop, PageTitle, Tables} from '../base';
import ContainerTable from './table';

const columns = ['id', 'number', 'hub', 'status'];
const headers = [{ id: 'Container ID', number: 'Container Number', hub: 'Hub ID', status: 'Active'}];

const ContainerPage = React.createClass({
  componentDidMount() {
    this.props.containersFetch();
  },
  handleCreate() {
    this.props.containerCreate();
  },
  render() {
    const {containers, isCreateError, isCreating, pickContainer} = this.props;

    return (
      <div>
        {
          isCreating ?
          <span style={{float: 'right'}}>Creating...</span> :
          <span style={{position: 'relative', float: 'right'}}>
            {
              isCreateError ?
              <span style={{float: 'right', color: 'red', position: 'absolute', top: '-20px', fontSize:'12px', right: '4px'}}>Create Failed</span> :
              <span />
            }
            <ButtonAtRightTop val={'Create Container'} onClick={this.handleCreate} />
          </span>
        }
        <PageTitle title={'Container List'} />
        <ContainerTable columns={columns} headers={headers} items={containers} rowClicked={pickContainer} />
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  const {containers, isCreating, isCreateError} = state.app.containers;
  return {
    containers: _.map(containers, (container) => ({
      id: container.ContainerID,
      number: container.ContainerNumber,
      hub: container.HubID,
      status: container.status
    })),
    isCreating: isCreating,
    isCreateError: isCreateError
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    containersFetch: function() {
      dispatch(containersFetch());
    },
    pickContainer: function(container) {
      if(container.status == 'Active') dispatch(push('/container/' + container.id));
    },
    containerCreate: function() {
      dispatch(containerCreate());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
