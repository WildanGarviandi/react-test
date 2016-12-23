import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import InboundOrdersTable from './inboundOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../base';
import * as InboundOrders from '../../modules/inboundOrders';
import * as TripDetails from '../../modules/inboundTripDetails';

const InboundOrdersPage = React.createClass({
  getInitialState() {
    return {
      orderMarked: ''
    }
  },
  changeMark(val) {
    this.setState({
      orderMarked: val,
    })
  },
  markReceived(val) {
    this.props.markReceived(val, "markReceivedInput", this.state.scanUpdateToggle);
    this.setState({
      orderMarked: "",
    });
  },
  submitReceived() {
    this.props.markReceived(this.state.orderMarked, null, this.state.scanUpdateToggle);
    this.setState({
      orderMarked: "",
    });
  },
  render() {
    const inputVerifyStyles = {
      container: styles.verifyInputContainer,
      input: styles.verifyInput
    };
    return (
      <Page title="Inbound Orders" additional="Deliver this order to next destination">
        <div className={styles.verifyContainer}>
          <Input styles={inputVerifyStyles} onChange={this.changeMark} onEnterKeyPressed={this.markReceived} ref="markReceived" 
            base={{value: this.state.orderMarked}} id="markReceivedInput" 
            placeholder={'Scan EDS, WebOrderID, or TripID...'} />
          <div onClick={this.submitReceived} className={styles.verifyButton}>Verify</div>
        </div>
        <InboundOrdersTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const {inboundOrders} = state.app;
  const userLogged = state.app.userLogged;

  return {
    userLogged
  }
}

function mapDispatchToProps (dispatch) {
  return {
    markReceived: function(scannedID, backElementFocusID, scanUpdateToggle) {
      dispatch(TripDetails.OrderReceived(scannedID, backElementFocusID, scanUpdateToggle));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InboundOrdersPage);