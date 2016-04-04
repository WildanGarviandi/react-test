import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import {ContainerListAction} from '../../modules';
import {ButtonAtRightTop, ButtonBase, Modal, PageTitle, Tables} from '../base';
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
        <ContainerTable />
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
      dispatch(ContainerListAction.create());
    },
    broadcast: function() {
      dispatch(ContainerListAction.broadcast());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerPage);
