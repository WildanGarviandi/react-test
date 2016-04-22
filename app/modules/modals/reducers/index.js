import {modalAction} from '../constants';

const initialState = { modals: [] };

function addModal(state, action) {
  return [...state, action.modal];
}

function closeModal(state, action) {
  return state.slice(1);
}

function reducer(state = initialState, action) {
  switch(action.type) {
    case modalAction.ADD_MODAL: {
      return _.assign({}, state, {
        modals: addModal(state.modals, action)
      });
    }

    case modalAction.CLOSE_MODAL: {
      return _.assign({}, state, {
        modals: closeModal(state.modals, action)
      });
    }

    default: return state;
  }
}

export default reducer;
