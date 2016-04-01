import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import broadcast from '../../modules/containers/actions/broadcast';
import containerCreate from '../../modules/containers/actions/containerCreate';
import containersFetch from '../../modules/containers/actions/containersFetch';
import {ButtonAtRightTop, ButtonBase, Modal, PageTitle, Tables} from '../base';
import ContainerTable from './table';
import styles from './styles.css';

const columns = ['id', 'number', 'hub', 'status'];
const headers = [{ id: 'Container ID', number: 'Container Number', hub: 'Hub ID', status: 'Active'}];

const ContainerPage = React.createClass({
  componentDidMount() {
    this.props.containersFetch();
  },
  getInitialState() {
    return {showModal: false};
  },
  handleCreate() {
    this.props.containerCreate();
  },
  handleBroadcast() {
    this.props.broadcast();
    this.setState({showModal: true});
  },
  closeModal() {
    this.setState({showModal: false});
  },
  render() {
    const {containers, isCreateError, isCreating, pickContainer, isFetching, message} = this.props;

    return (
      <div>
        {
          isCreating ?
          <span style={{float: 'right', marginLeft: 10}}>Creating...</span> :
          <span style={{position: 'relative', float: 'right'}}>
            {
              isCreateError ?
              <span style={{float: 'right', color: 'red', position: 'absolute', top: '-20px', fontSize:'12px', right: '4px'}}>Create Failed</span> :
              <span />
            }
            <ButtonAtRightTop val={'Create Container'} onClick={this.handleCreate} />
          </span>
        }
        <ButtonAtRightTop val={'Broadcast'} onClick={this.handleBroadcast} />
        <PageTitle title={'Container List'} />
        <ContainerTable columns={columns} headers={headers} items={containers} rowClicked={pickContainer} />
        <Modal show={this.state.showModal} width={250}>
          {message}
          <br/>
          {
            isFetching ?
            <span /> :
            <ButtonBase onClick={this.closeModal} className={styles.modalBtn}>Close</ButtonBase>
          }
        </Modal>
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  const {containers, isCreating, isCreateError} = state.app.containers;
  const {isFetching, message} = state.app.broadcast;
  return {
    containers: _.map(containers, (container) => ({
      id: container.ContainerID,
      number: container.ContainerNumber,
      hub: container.HubID,
      status: container.status
    })),
    isCreating: isCreating,
    isCreateError: isCreateError,
    isFetching: isFetching,
    message: message
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
    },
    broadcast: function() {
      dispatch(broadcast());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
