import React from 'react';
import {connect} from 'react-redux';

import {ContainersAction} from '../../modules';
import {setReceived} from '../../modules/containers/actions/containersFetch';
import {ButtonBase, ButtonWithLoading, Modal, Page} from '../base';
import ContainerTable from './containerTable';
import ContainerInfo from './containerInfographic';
import styles from './styles.scss';

const MessageModal = React.createClass({
  propTypes: {
    closeModal: React.PropTypes.func,
    message: React.PropTypes.string,
    show: React.PropTypes.bool
  },
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
  propTypes: {
    broadcast: React.PropTypes.func,
    broadcastState: React.PropTypes.object,
    container: React.PropTypes.object,
    containerCreate: React.PropTypes.func
  },
  getInitialState() {
    return {showModalBroadcast: false, showModalContainer: false};
  },
  componentWillMount() {
    this.props.initialLoad();
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
    };

    const broadcastBtnProps = {
      textBase: 'Broadcast',
      textLoading: 'Broadcasting',
      isLoading: broadcastState.isFetching,
      onClick: this.handleBroadcast
    };

    const broadcastModalProps = {
      show: this.state.showModalBroadcast && !broadcastState.isFetching,
      message: broadcastState.message,
      closeModal: this.closeModal
    };

    const containerModalProps = {
      show: this.state.showModalContainer && !container.isCreating && container.isCreateError,
      message: container.message,
      closeModal: this.closeModal
    };

    return (
      <div>
        <Page title={'Container List'}>
          <ButtonWithLoading {...createContainerBtnProps} />
          <ButtonWithLoading {...broadcastBtnProps} />
          <ContainerInfo />
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    containerCreate: function() {
      dispatch(ContainersAction.create());
    },
    broadcast: function() {
      dispatch(ContainersAction.broadcast());
    },
    initialLoad: function() {
      dispatch(setReceived(false));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
