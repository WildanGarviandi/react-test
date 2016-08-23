import React from 'react';
import {connect} from 'react-redux';

import ModalActions from '../../modules/modals/actions';

import {ButtonBase, Modal} from '.';
import styles from './modal.css';

const ModalMessage = React.createClass({
  handleClose() {
    this.props.closeModal();
  },
  doCancel() {
    this.props.doCancel();
  },
  doConfirm() {
    this.props.doConfirm();
  },
  render() {
    const {modal, show} = this.props;
    const {message, width, onConfirm} = modal;

    return (
      <Modal show={modal} width={width || 300}>
        {message}
        <div style={{clear: 'both'}} />
        {
          onConfirm ?
          <span>
            <ButtonBase onClick={this.doCancel} styles={styles.modalBtn}>No</ButtonBase>
            <ButtonBase onClick={this.doConfirm} styles={styles.modalBtnY}>Yes</ButtonBase>
          </span>
          :
          <ButtonBase onClick={this.handleClose} styles={styles.modalBtn}>Close</ButtonBase>
        }
        <div style={{clear: 'both'}} />
      </Modal>
    );
  }
});

function StateToProps(state) {
  const {modals} = state.app.modals;
  return {
    show: modals.length > 0,
    modal: modals[0],
  }
}

function DispatchToProps(dispatch) {
  return {
    closeModal() {
      dispatch(ModalActions.closeModal());
    },
    doCancel() {
      dispatch(ModalActions.doCancel());
    },
    doConfirm() {
      dispatch(ModalActions.doConfirm());
    },
  }
}

export default connect(StateToProps, DispatchToProps)(ModalMessage);
