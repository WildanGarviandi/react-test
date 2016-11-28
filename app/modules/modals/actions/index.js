import {modalAction} from '../constants';

function addModal(modal) {
  return {type: modalAction.ADD_MODAL, modal: modal};
}

function addError(errorMessage) {
  return addModal({
    message: errorMessage,
  });
}

function addConfirmation({action, cancel, message}) {
  return addModal({
    action, cancel, message,
    onConfirm: true,
  });
}

function doCancel() {
  return (dispatch, getState) => {
    const {modals} = getState().app.modals;
    let cancel;
    if(modals[0] && modals[0].cancel) {
      cancel = modals[0].cancel();
    }

    dispatch(closeModal());
    if(cancel) {
      dispatch(cancel());
    }
  }
}

function doConfirm() {
  return (dispatch, getState) => {
    const {modals} = getState().app.modals;
    let action;
    if(modals[0] && modals[0].action) {
      action = modals[0].action;
    }

    dispatch(closeModal());
    if(action) {
      dispatch(action());
    }
  }
}

function addMessage(message, backElementFocusID) {
  return addModal({message, backElementFocusID});
}

function closeModal() {
  return {type: modalAction.CLOSE_MODAL};
}

export default {
  addConfirmation, addError, addMessage, addModal, closeModal,
  doCancel, doConfirm,
};
