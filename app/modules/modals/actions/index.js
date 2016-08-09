import {modalAction} from '../constants';

function addModal(modal) {
  return {type: modalAction.ADD_MODAL, modal: modal};
}

function addError(errorMessage) {
  return addModal({
    message: errorMessage,
  });
}

function addMessage(message) {
  return addModal({message});
}

function closeModal() {
  return {type: modalAction.CLOSE_MODAL};
}

export default {
  addError, addMessage, addModal, closeModal,
};
