import React from 'react';
import {connect} from 'react-redux';

import {ModalActions} from '../../modules';

import {ButtonBase, Modal} from '.';
import styles from './modal.css';

const ModalMessage = React.createClass({
  handleClose() {
    this.props.closeModal();
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
            <ButtonBase onClick={this.handleClose} styles={styles.modalBtn}>OK</ButtonBase>
            <ButtonBase onClick={this.handleClose} styles={styles.modalBtn}>Cancel</ButtonBase>
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
  }
}

export default connect(StateToProps, DispatchToProps)(ModalMessage);
