import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import {ContainersAction} from '../../modules';
import {ButtonBase, ButtonWithLoading, Modal, Page, Tables} from '../base';
import ContainerTable from './containerTable';
import styles from './styles.css';

const ContainerPage = React.createClass({
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
    const {isCreateError, isCreating, pickContainer, isFetching, message} = this.props;
    const createContainerBtnProps = {
      textBase: 'Create Container',
      textLoading: 'Creating Container',
      isLoading: isCreating,
      onClick: this.handleCreate
    }

    return (
      <div>
        <Page title={'Container List'}>
          <ButtonWithLoading {...createContainerBtnProps} />
          <ButtonWithLoading textBase={'Broadcast'} onClick={this.handleBroadcast} />
          <ContainerTable />
          <Modal show={this.state.showModal} width={250}>
            {message}
            <br/>
            {
              !isFetching &&
              <ButtonBase onClick={this.closeModal} styles={styles.modalBtn}>Close</ButtonBase>
            }
          </Modal>
        </Page>
      </div>
    );
  }
});

const mapStateToProps = (state) => {
  const {isCreating, isCreateError} = state.app.containers;
  const {isFetching, message} = state.app.broadcast;
  return {
    isCreating: isCreating,
    isCreateError: isCreateError,
    isFetching: isFetching,
    message: message
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    pickContainer: function(container) {
      if(container.status == 'Active') dispatch(push('/container/' + container.id));
    },
    containerCreate: function() {
      dispatch(ContainersAction.create());
    },
    broadcast: function() {
      dispatch(ContainersAction.broadcast());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
