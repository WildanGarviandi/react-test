import lodash from 'lodash';

function DictAssign(dict, colls, f) {
  return lodash.reduce(colls, (accumulator, coll) => {
    accumulator[f(coll)] = coll;
    return accumulator;
  }, lodash.assign({}, dict));
}

const initialListState = {
  dict: {},
  shown: [],
  isLoading: false,
}

export function CollReducer(fetchAction, idFunc) {
  return (state = lodash.assign({}, initialListState), action) => {
    switch(action.type) {
      case fetchAction.START: {
        return lodash.assign({}, state, {isLoading: true});
      }

      case fetchAction.FAILED: {
        return lodash.assign({}, state, {isLoading: false});
      }

      case fetchAction.RECEIVED: {
        return lodash.assign({}, state, {
          dict: DictAssign(state.dict, action.list, idFunc),
          shown: lodash.map(action.list, idFunc),
          isLoading: false,
        });
      }

      default: return state;
    }    
  }
}
