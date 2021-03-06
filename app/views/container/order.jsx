import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import * as _ from 'lodash';
import ordersPrepareFetch from '../../modules/containers/actions/ordersPrepare';
import {ButtonBase, PageTitle} from '../base';

const columns = ['id', 'id2', 'pickup', 'dropoff', 'time', 'status'];
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', status: 'Status'
}];

import styles from './styles.scss';

const FetchComponent = React.createClass({
  getInitialState() {
    return {IDs: ''};
  },
  changeIDs(e) {
    this.setState({IDs: e.target.value});
  },
  startFetch() {
    const IDs = _.chain(this.state.IDs.match(/\S+/g)).uniq().value();
    this.props.ordersPrepareFetch(IDs);
  },
  render() {
    const {changeIDs, startFetch} = this;
    const {errorMsg, isFetching, isValid} = this.props;
    const {IDs} = this.state;

    return (
      <form action="javascript:;">
        <label htmlFor="containerID">Orders ID :</label>
        <div>
          <textarea style={{height: 350, width: '100%'}} value={IDs} onChange={changeIDs}/>
        </div>
        {
          isFetching ? 
          <span className={styles.checkingStatus}>Checking...</span> :
          <div>
            { isValid ? <span /> : <span className={styles.errorMsg}>{errorMsg}</span> }
            <div style={{clear: 'both'}}>
              <ButtonBase className={styles.modalBtn} type={'submit'} onClick={startFetch}>Check</ButtonBase>
            </div>
          </div>
        }
      </form>
    );
  }
});

const FetchState = (state) => {
  const {isFetching, isValid, error} = state.app.ordersPrepared;
  return {
    isFetching: isFetching, isValid: isValid, errorMsg: error
  }
}

const FetchDispatch = (dispatch, ownProps) => {
  return {
    ordersPrepareFetch: function(ordersID) {
      dispatch(ordersPrepareFetch(ordersID, ownProps.id));
    }  
  }
}

const FetchContainer = connect(FetchState, FetchDispatch)(FetchComponent);

const FillPage = React.createClass({
  render() {
    const {backToContainer, container, showFetch} = this.props;
    return (
      <div>
        <a href="javascript:;" onClick={backToContainer}>{'<<'} Back to Container Detail</a>
        <div>
          <PageTitle title={'Container ' + container.ContainerNumber} />
          <FetchContainer id={this.props.params.id} />
        </div>
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {containers, ordersPrepared} = state.app;
  const container = _.find(containers.containers, (container) => (container.ContainerID == containers.active));
  const {isFetching, isValid, error, ids} = ordersPrepared;
  return {
    container: container,
    showFetch: isFetching || !isValid || ids.length == 0
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container/' + ownProps.params.id));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FillPage);
