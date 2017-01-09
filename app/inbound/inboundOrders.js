import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import InboundOrdersTable from './inboundOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../views/base';
import * as InboundOrders from './inboundOrdersService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

const DuplicateModal = React.createClass({
  componentWillUnmount() {
    document.getElementById('markReceivedInput') && document.getElementById('markReceivedInput').focus();
  },
  closeModal() {
    this.props.closeModal();
  },
  pickOrder(id) {
    this.props.pickOrder(id);
    this.closeModal();
  },
  render() {
    const thisComponent = this;
    const ordersContent = this.props.orders.map(function (order, index) {
      return (
        <div className={styles.orderContent} key={index} onClick={thisComponent.pickOrder.bind(null, order.UserOrderNumber)}>
          <div className={styles.orderContentLeft}>
            <div className={styles.smallText}>To</div>
            { order.DropoffAddress &&
              <div>
                <div className={styles.bigText}>{order.DropoffAddress.FirstName + ' ' + order.DropoffAddress.LastName}</div>
                <div className={styles.mediumText}>{order.DropoffAddress.City}</div>
              </div>
            }
          </div>
          <div className={styles.orderContentRight}>
            <div className={styles.textCenter}>
              <div className={styles.smallTextBold}>{order.UserOrderNumber}</div>
              <div className={styles.smallText}>({order.WebOrderID})</div>
            </div>
          </div>
        </div>
      );
    });

    return (
      <ModalDialog>
        <button className={styles.closeModalButton} onClick={this.closeModal}>
          <img src="/img/icon-close.png" className={groupingStyles.closeButtonImage}/>
        </button>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Please pick the right one</h2>
            <div className={styles.smallText}>
              Order <strong>{this.props.orders[0].WebOrderID}</strong> was found in more than one data</div>
          </div>
          <div className={styles.modalContent1 + ' ' + styles.ordersContent}>
            {ordersContent}
          </div>
        </div>
      </ModalDialog>
    );
  }
});

const InboundOrdersPage = React.createClass({
  getInitialState() {
    return {
      orderMarked: '',
      isDuplicate: false
    }
  },
  componentDidMount() {
    document.getElementById('markReceivedInput').focus();
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps['isDuplicate']) {
      this.setState({isDuplicate: true});
    }
  },
  changeMark(val) {
    this.setState({
      orderMarked: val,
    })
  },
  markReceived(val) {
    if (val === '') {
      return;
    }
    this.props.markReceived(val);
    this.setState({
      orderMarked: "",
    });
  },
  closeModal() {
    this.setState({isDuplicate: false});
  },
  render() {
    const inputVerifyStyles = {
      container: styles.verifyInputContainer,
      input: styles.verifyInput
    };
    return (
      <Page title="Inbound Orders" count={{itemName: 'Items', done: 'All Done', value: this.props.total}}>
        {
          this.state.isDuplicate &&
          <ModalContainer onClose={this.closeModal}>
            <DuplicateModal orders={this.props.duplicateOrders} closeModal={this.closeModal} pickOrder={this.markReceived} />
          </ModalContainer>
        }
        <div className={styles.actionContainer}>
          <Input styles={inputVerifyStyles} onChange={this.changeMark} onEnterKeyPressed={this.markReceived} ref="markReceived" 
            base={{value: this.state.orderMarked, placeholder: 'Scan EDS, WebOrderID, or TripID...'}} id="markReceivedInput" />
          <button onClick={this.markReceived.bind(null, this.state.orderMarked)} className={styles.verifyButton} 
            disabled={this.state.orderMarked === ''} >Verify</button>
        </div>
        <InboundOrdersTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const { inboundOrders } = state.app;
  const userLogged = state.app.userLogged;
  const { duplicateOrders, isDuplicate, total } = inboundOrders;

  return {
    userLogged,
    duplicateOrders,
    isDuplicate,
    total
  }
}

function mapDispatchToProps (dispatch) {
  return {
    markReceived: function(scannedID) {
      dispatch(InboundOrders.MarkReceived(scannedID));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InboundOrdersPage);