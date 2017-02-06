import lodash from 'lodash';
import Constants from '../constants';
import {OrderParser} from '../selector';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import ModalActions from '../../modals/actions';
import {push} from 'react-router-redux';
import {modalAction} from '../../modals/constants';
import * as DashboardService from '../../../dashboard/dashboardService';

export const setLimit = (limit) => {
  return (dispatch) => {
    dispatch({
      type: Constants.PICKUP_ORDERS_SET_STATE,
      updatedState: {
        limit: limit,
        currentPage: 1,
      }
    });
    dispatch(fetchList());
  };
};

export const setCurrentPage = (currentPage) => {
  return (dispatch) => {
    dispatch({
      type: Constants.PICKUP_ORDERS_SET_STATE,
      updatedState: {
        currentPage: currentPage,
      }
    });
    dispatch(fetchList());
  };
};

export const setFilter = (filter) => {
  return (dispatch) => {
    dispatch({
      type: Constants.PICKUP_ORDERS_SET_FILTER,
      filter: filter,
    });
    dispatch(fetchList());
  };
};

export const setSelected = (indexes, value) => {
  return (dispatch, getState) => {
    const {pickupOrders} = getState().app;
    const {selected} = pickupOrders;

    const newSelected = lodash.reduce(indexes, (result, idx) => {
      return lodash.assign({}, result, {[idx]: value});
    }, selected);

    dispatch({
      type: Constants.PICKUP_ORDERS_SET_SELECTED,
      selected: newSelected,
    });
  }
}

export const setSelectedAll = (value) => {
  return (dispatch, getState) => {
    const {pickupOrders} = getState().app;
    const {list} = pickupOrders;

    const newSelected = lodash.reduce(lodash.range(list.length), (result, idx) => {
      return lodash.assign({}, result, {[idx]: value});
    }, {});

    dispatch({
      type: Constants.PICKUP_ORDERS_SET_SELECTED,
      selected: newSelected,
    });
  }
}

export const groupOrders = () => {
  return (dispatch, getState) => {
    const {userLogged, pickupOrders} = getState().app;
    const {list, selected} = pickupOrders;
    const {token} = userLogged;

    const selectedOrders = lodash.filter(list, (order, index) => {
      return selected[index];
    });

    const query = {
      ordersID: lodash.map(selectedOrders, (order) => (order.UserOrderID)),
    };

    dispatch({ type: Constants.PICKUP_ORDERS_GROUP_START });
    fetchPost('/trip/firstLeg', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({ type: Constants.PICKUP_ORDERS_GROUP_END });
          dispatch(push('/trips/inbound/' + data.TripID));
        });
      } else {
        dispatch({ type: Constants.PICKUP_ORDERS_GROUP_END });
        dispatch(ModalActions.addMessage('Failed to group orders'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.PICKUP_ORDERS_GROUP_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}

export const fetchList = (isFill) => {
  return (dispatch, getState) => {
    const {userLogged, pickupOrders} = getState().app;
    const {token, hubID} = userLogged;
    const {currentPage, limit, filter} = pickupOrders;

    const query = lodash.assign({}, filter, {
      hubID: hubID,
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    if (isFill) {
      query['status'] = 6;
    }

    dispatch({ type: Constants.PICKUP_ORDERS_FETCH_START, query: query });
    fetchGet('/order/pickup', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          const orders = lodash.map(data.rows, OrderParser);
          dispatch({
            type: Constants.PICKUP_ORDERS_SET_LIST,
            total: data.count,
            list: orders,
          });
          dispatch({ type: Constants.PICKUP_ORDERS_FETCH_END });
        });
      } else {
        dispatch({ type: Constants.PICKUP_ORDERS_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to fetch pickup orders'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.PICKUP_ORDERS_FETCH_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}

export const fillTrip = (tripID) => {
  return (dispatch, getState) => {
    const {userLogged, pickupOrders} = getState().app;
    const {orders, selected} = pickupOrders;
    const {token} = userLogged;

    let forbidden = false;
    const checkedOrdersIDs = lodash.chain(orders)
      .filter((order) => {
        if (order.IsChecked && order.OrderStatus !== 'NOTASSIGNED') {
          forbidden = true;
        }
        return order.IsChecked;
      })
      .map((order) => (order.UserOrderID))
      .value();

    if (forbidden) {
      dispatch(ModalActions.addMessage('There’s one or more order not ready for pickup. Please check again'));
      return;
    }

    if (checkedOrdersIDs.length === 0) {
      dispatch(ModalActions.addMessage('No order selected'));
      return;
    }

    const body = {
      ordersID: checkedOrdersIDs,
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({ type: Constants.RECEIVED_ORDERS_GROUP_START });
    fetchPost(`/trip/${tripID}/orders`, token, body).then(function(response) {
      dispatch({type: modalAction.BACKDROP_HIDE});
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({ type: Constants.RECEIVED_ORDERS_GROUP_END });
          dispatch(push('/trips/' + tripID));
          dispatch(DashboardService.FetchCount());
        });
      } else {
        dispatch({ type: Constants.RECEIVED_ORDERS_GROUP_END });
        dispatch(ModalActions.addMessage('Failed to add orders'));
      }
    }).catch(() => { 
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({ type: Constants.RECEIVED_ORDERS_GROUP_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}
