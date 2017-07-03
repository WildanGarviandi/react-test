import React from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';

import ModalActions from '../../modules/modals/actions';

import {ButtonBase, Modal} from '.';
import styles from './modal.scss';

const ModalMessage = React.createClass({
  componentDidMount() {
    var thisClass = this;
    var timeout = setTimeout(function () {
      (!thisClass.props.modal.onConfirm) ? ReactDOM.findDOMNode(thisClass.refs.elementForModalFocus).focus() :
        (thisClass.props.modal.yesFocus) ? ReactDOM.findDOMNode(thisClass.refs.yesButton).focus() :
        ReactDOM.findDOMNode(thisClass.refs.noButton).focus();
      clearTimeout(timeout);
    }, 100)
  },
  componentWillUnmount() {
    if (document.getElementById(this.props.modal.backElementFocusID)) {
      document.getElementById(this.props.modal.backElementFocusID).focus();
    }
  },
  handleClose() {
    this.props.closeModal();
  },
  doCancel() {
    this.props.doCancel();
  },
  doConfirm() {
    this.props.doConfirm();
  },
  keyDownNoButton(e) {
    if ([39, 37].indexOf(e.keyCode) !== -1) {
      ReactDOM.findDOMNode(this.refs.yesButton).focus()
    }
  },
  keyDownYesButton(e) {
    if ([39, 37].indexOf(e.keyCode) !== -1) {
      ReactDOM.findDOMNode(this.refs.noButton).focus()
    }
  },
  render() {
    const {modal, show} = this.props;
    const {message, width, onConfirm} = modal;

    return (
      <Modal show={modal} width={width || 300} className={styles.modal}>
        <div className={styles.messageContainer}>{message}</div>
        <div className={styles.closeBtn} onClick={this.handleClose}>
          <img src="/img/icon-close.png" width="24" height="24"/>
        </div>
        <button className={styles.focusBtn} type=""></button>
        <div className={styles.btnContainer}>
        {
          onConfirm ?
          <span>
            <ButtonBase ref="noButton" onClick={this.doCancel} styles={styles.modalBtn} onKeyDown={this.keyDownNoButton}>No</ButtonBase>
            <ButtonBase ref="yesButton" onClick={this.doConfirm} styles={styles.modalBtnY} onKeyDown={this.keyDownYesButton}>Yes</ButtonBase>
          </span>
          :
          <ButtonBase ref="elementForModalFocus" onClick={this.handleClose} styles={styles.modalBtn}>Close</ButtonBase>
        }
        </div>
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
