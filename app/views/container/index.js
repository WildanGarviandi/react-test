import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import {ContainersAction} from '../../modules';
import {ButtonBase, ButtonWithLoading, Modal, Page, Tables} from '../base';
import ContainerTable from './containerTable';
import styles from './styles.css';

const MessageModal = React.createClass({
  handleClose() {
    const {closeModal} = this.props;
    closeModal();
  },
  render() {
    const {message, show} = this.props;

    return (
      <Modal show={show} width={250}>
        {message}
        <br/>
        <ButtonBase onClick={this.handleClose} styles={styles.modalBtn}>Close</ButtonBase>
      </Modal>
    );
  }
});

const ContainerPage = React.createClass({
  getInitialState() {
    return {showModalBroadcast: false, showModalContainer: false};
  },
  handleCreate() {
    this.props.containerCreate();
    this.setState({showModalContainer: true});
  },
  handleBroadcast() {
    this.props.broadcast();
    this.setState({showModalBroadcast: true});
  },
  closeModal() {
    this.setState({showModalBroadcast: false, showModalContainer: false});
  },
  render() {
    const {broadcastState, container} = this.props;
    const createContainerBtnProps = {
      textBase: 'Create Container',
      textLoading: 'Creating Container',
      isLoading: container.isCreating,
      onClick: this.handleCreate
    }

    const broadcastBtnProps = {
      textBase: 'Broadcast',
      textLoading: 'Broadcasting',
      isLoading: broadcastState.isFetching,
      onClick: this.handleBroadcast
    }

    const broadcastModalProps = {
      show: this.state.showModalBroadcast && !broadcastState.isFetching,
      message: broadcastState.message,
      closeModal: this.closeModal
    }

    const containerModalProps = {
      show: this.state.showModalContainer && !container.isCreating && container.isCreateError,
      message: container.message,
      closeModal: this.closeModal
    }

    return (
      <div>
        <Page title={'Container List'}>
          <ButtonWithLoading {...createContainerBtnProps} />
          <ButtonWithLoading {...broadcastBtnProps} />
          <ContainerTable />
          <MessageModal {...broadcastModalProps} />
          <MessageModal {...containerModalProps} />
        </Page>
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  const {isCreating, isCreateError} = state.app.containers;
  const {isFetching, message} = state.app.broadcast;
  return {
    broadcastState: {
      isFetching: isFetching,
      message: message
    },
    container: {
      isCreating: isCreating,
      isCreateError: isCreateError,
      message: 'Create Container Failed'
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    containerCreate: function() {
      dispatch(ContainersAction.create());
    },
    broadcast: function() {
      dispatch(ContainersAction.broadcast());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
