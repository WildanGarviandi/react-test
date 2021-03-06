import { modalAction } from '../constants';

const initialState = { modals: [], showBackdrop: false };

function addModal(state, action) {
  return [...state, action.modal];
}

function closeModal(state) {
  return state.slice(1);
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case modalAction.ADD_MODAL: {
      return Object.assign({}, state, {
        modals: addModal(state.modals, action),
      });
    }

    case modalAction.CLOSE_MODAL: {
      return Object.assign({}, state, {
        modals: closeModal(state.modals, action),
      });
    }

    case modalAction.BACKDROP_SHOW: {
      return Object.assign({}, state, {
        showBackdrop: true,
      });
    }

    case modalAction.BACKDROP_HIDE: {
      return Object.assign({}, state, {
        showBackdrop: false,
      });
    }

    default: return state;
  }
}

export default reducer;
