import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
  FETCH_COUNT: 'FETCH_COUNT',
  FETCH_LIST: 'FETCH_LIST',
  EXPAND_ORDER: 'EXPAND_ORDER',
  HIDE_ORDER: 'HIDE_ORDER',
  EXPAND_ATTEMPT: 'EXPAND_ATTEMPT',
  SHOW_ATTEMPT_MODAL: 'SHOW_ATTEMPT_MODAL',
  HIDE_ATTEMPT_MODAL: 'HIDE_ATTEMPT_MODAL',
  HIDE_ATTEMPT: 'HIDE_ATTEMPT',
  TOGGLE_CHECK_ALL: 'TOGGLE_CHECK_ALL',
  TOGGLE_SELECT_ORDER: 'TOGGLE_SELECT_ORDER',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_LIMIT: 'SET_LIMIT',
  SET_ORDERS: 'SET_ORDERS'
}

const initialStore = {
  currentPage: 1,
  limit: 100,
  total: 0,
  isExpanded: false,
  expandedOrder: {},
  expandedAttempt: false,
  selectedAll: false,
  orders: [],
  count: {
    totalDelivery: '-',
    pendingDelivery: '-',
    succeedDelivery: '-',
    failedDelivery: '-'
  },
  modal: {
    addAttempt: false
  }
}

export default function Reducer(store = initialStore, action) {
  switch(action.type) {
    case Constants.FETCH_COUNT: {
      return lodash.assign({}, store, {
        count: action.count
      });
    }

    case Constants.EXPAND_ORDER: {
      return lodash.assign({}, store, {
        isExpanded: true,
        expandedOrder: action.order
      });
    }

    case Constants.HIDE_ORDER: {
      return lodash.assign({}, store, {
        isExpanded: false,
        expandedOrder: {}
      });
    }

    case Constants.EXPAND_ATTEMPT: {
      return lodash.assign({}, store, {
        expandedAttempt: true
      });
    }

    case Constants.HIDE_ATTEMPT: {
      return lodash.assign({}, store, {
        expandedAttempt: false
      });
    }

    case Constants.SET_ORDERS: {
      return lodash.assign({}, store, {
        total: action.total,
        orders: action.orders
      });
    }

    case Constants.TOGGLE_CHECK_ALL: {
      const {orders, selectedAll} = store;
      const newOrders = lodash.map(orders, (order) => {
        return lodash.assign({}, order, {IsChecked: !selectedAll});
      });

      return lodash.assign({}, store, {
        selectedAll: !selectedAll,
        orders: newOrders,
      })
    }

    case Constants.TOGGLE_SELECT_ORDER: {
      const newOrders= lodash.map(store.orders, (order) => {
        if(order.UserOrderNumber !== action.orderId) {
            return order;
        }
        return lodash.assign({}, order, {IsChecked: !order.IsChecked});
      });

      return lodash.assign({}, store, {
        orders: newOrders,
      });
    }

    case Constants.SHOW_ATTEMPT_MODAL: {
      return lodash.assign({}, store, {
        modal: {addAttempt: true}
      });
    }

    case Constants.HIDE_ATTEMPT_MODAL: {
      return lodash.assign({}, store, {
        modal: {addAttempt: false}
      });
    }

    case Constants.SET_CURRENT_PAGE: {
      return lodash.assign({}, store, {
        currentPage: action.currentPage
      });
    }

    case Constants.SET_LIMIT: {
      return lodash.assign({}, store, {
        limit: action.limit
      });
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/delivery-counter', token).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.FETCH_COUNT,
          count: data.count
        });
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const temp = [
      {
        DropoffAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Doe"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396244",
        IsChecked: false,
        DueTime: "2017-05-05T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          FirstName: "Luck",
          LastName: "Manthis"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
      {
        DropoffAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Wick"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21353131",
        IsChecked: false,
        DueTime: "2017-05-09T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          FirstName: "Kurt",
          LastName: "Skip"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
      {
        DropoffAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Doe"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21512624",
        IsChecked: false,
        DueTime: "2017-05-07T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          FirstName: "Kil",
          LastName: "Bill"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
      {
        DropoffAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Doe"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21512412",
        IsChecked: false,
        DueTime: "2017-05-07T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          FirstName: "Kil",
          LastName: "Bill"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
      {
        DropoffAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Doe"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21512312",
        IsChecked: false,
        DueTime: "2017-05-07T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          FirstName: "Kil",
          LastName: "Bill"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
      {
        DropoffAddress: {
          Address1: "Jl. Muara Karang Block A-V Utara No. 5,Jakarta Utara 14450",
          City: "Jakarta Barat",
          FirstName: "John",
          LastName: "Doe"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21512332",
        IsChecked: false,
        DueTime: "2017-05-07T11:00:00.000Z",
        IsCOD: false,
        PackageWeight: 1,
        TotalValue: 130000,
        PickupAddress: {
          Address1: "Jl. Musi No. 36, Jelambar,Jakarta Pusat 10150",
          FirstName: "Kil",
          LastName: "Bill"
        },
        User: {
          FirstName: "Chuck",
          LastName: "Norris"
        },
        OrderStatus: {
          OrderStatus: "NOTASSIGNED",
          OrderStatusID: 6
        }
      },
    ];

    dispatch({
      type: Constants.SET_ORDERS,
      total: temp.length,
      orders: temp
    })
  }
}

export function ExpandOrder(order) {
  return { type: Constants.EXPAND_ORDER, order: order }
}

export function HideOrder() {
  return(dispatch, getApp) => {
    dispatch({ type: Constants.HIDE_ORDER })
    dispatch({ type: Constants.HIDE_ATTEMPT })
  }
}

export function ExpandAttempt () {
  return { type: Constants.EXPAND_ATTEMPT }
}

export function HideAttempt () {
  return { type: Constants.HIDE_ATTEMPT }
}

export function ShowAttemptModal () {
  return { type: Constants.SHOW_ATTEMPT_MODAL }
}

export function HideAttemptModal () {
  return { type: Constants.HIDE_ATTEMPT_MODAL }
}

export function ToggleCheckAll() {
  return { type: Constants.TOGGLE_CHECK_ALL }
}

export function ToggleSelectOrder(orderId) {
  return { type: Constants.TOGGLE_SELECT_ORDER, orderId: orderId }
}

export function SetCurrentPage(currentPage) {
  return { type: Constants.SET_CURRENT_PAGE, currentPage: currentPage }
}

export function SetLimit(limit) {
  return { type: Constants.SET_LIMIT, limit: limit }
}
