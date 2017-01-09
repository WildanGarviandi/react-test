import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import GroupingTable from './groupingTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page, InputWithDefault} from '../views/base';
import * as Grouping from './groupingService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactDOM from 'react-dom';
import ModalActions from '../modules/modals/actions';

const CreateTripModal = React.createClass({
  getInitialState() {
    return {
      addOrderQuery: '',
      orders: this.props.addedOrders || [],
      isSuccessCreating: false,
    }
  },
  stateChange(key) {
    return (value) => {
      this.setState({[key]: value});
    };
  },
  componentDidMount() {
    document.getElementById('addOrder') && document.getElementById('addOrder').focus();
  },
  componentWillReceiveProps(nextProps) {
    if (!nextProps['isDuplicate'] && !nextProps['isSuccessCreating']) {
      document.getElementById('addOrder') && document.getElementById('addOrder').focus();
    }

    this.setState({
      orders: nextProps.addedOrders,
      isSuccessCreating: nextProps['isSuccessCreating']
    });
  },
  componentDidUpdate() {
    this.state.isSuccessCreating && document.getElementById('gotItButton') && document.getElementById('gotItButton').focus();
  },
  closeModal() {
    const thisClass = this;
    function close () {
      thisClass.setState({
        trip: {},
        orders: []
      });
      thisClass.props.onClose();
    }
    if (this.state.orders.length > 0) {
      this.props.askClose({
        message: 'Are you sure to close? Your changes will be lost.',
        action: function () {
          close();
        },
        backElementFocusID: 'addOrder'
      });
    } else {
      close();
    }
  },
  createTrip() {
    this.props.createTrip();
  },
  confirmSuccess() {
    this.closeModal();
  },
  addOrder() {
    if (this.state.addOrderQuery === "") {
      return;
    }
    this.setState({addOrderQueryCopy: this.state.addOrderQuery});
    this.setState({addOrderQuery: ''});
    this.props.addOrder(this.state.addOrderQuery, 'addOrder');
  },
  chooseOrder(val) {
    this.props.addOrder(val, 'addOrder');
  },
  componentWillUnmount() {
    document.getElementById("prepareBtn") && document.getElementById("prepareBtn").focus();
  },
  render() {
    const {createdTrip, isDuplicate, duplicateOrders} = this.props;
    const canCreate = this.state.orders.length > 0;
    var totalWeight = 0;

    const ordersContent = this.state.orders.map(function (order, index) {
      totalWeight += order.PackageWeight;
      return (
        <div className={styles.orderContent} key={index}>
          <div className={styles.orderContentLeft}>
            <div className={styles.smallText}>To</div>
            { order.DropoffAddress &&
              <div>
                <div className={styles.mediumText}>{order.DropoffAddress.FirstName + ' ' + order.DropoffAddress.LastName}</div>
                <div className={styles.smallText}>
                  {order.DropoffAddress.Address1 + ', ' + order.DropoffAddress.Address2 + ', ' + order.DropoffAddress.City + ', ' +
                    order.DropoffAddress.ZipCode}
                </div>
              </div>
            }
          </div>
          <div className={styles.orderContentRight}>
            <div style={{textAlign: 'center'}}>
              <div className={styles.smallTextBold}>{order.UserOrderNumber}</div>
              <div className={styles.smallTextBold}>({order.WebOrderID})</div>
            </div>
          </div>
        </div>
      );
    });

    var duplicateOrdersContent = [];

    if (isDuplicate) {
      const thisComponent = this;
      duplicateOrdersContent = duplicateOrders.map(function (order, index) {
        return (
          <div className={styles.orderContent + ' ' + styles.orderContentHover} key={index} 
            onClick={thisComponent.chooseOrder.bind(null, order.UserOrderNumber)}>
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
              <div style={{textAlign: 'center'}}>
                <div className={styles.smallTextBold}>{order.UserOrderNumber}</div>
                <div className={styles.smallText}>({order.WebOrderID})</div>
              </div>
            </div>
          </div>
        );
      });
    }

    return (
      <ModalDialog>
        { isDuplicate &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Please pick the right one</h2>
              <div className={styles.smallText}>
                Order <strong>{this.state.addOrderQueryCopy}</strong> was found in more than one data</div>
            </div>
            <div className={styles.modalContent1 + ' ' + styles.ordersContent}>
              {duplicateOrdersContent}
            </div>
          </div>
        }
        { !this.state.isSuccessCreating && !isDuplicate &&
          <div className={styles.modal}>
            <button className={styles.closeModalButton} onClick={this.closeModal}>
              <img src="/img/icon-close.png" className={styles.closeButtonImage}/></button>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Orders to Bag</h2>
              <div className={styles.modalInfo}>
                <div className={styles.orderContentLeft}>
                  <div className={styles.smallText}>Total Orders</div>
                  <h2 className={styles.bigText}>{this.state.orders.length}</h2>
                </div>
                <div className={styles.orderContentRight}>
                  <div className={styles.smallText}>Total Weight (kg)</div>
                  <h2 className={styles.bigText}>{totalWeight}</h2>
                </div>
                <div style={{clear: 'both'}}></div>
              </div>
            </div>

            <div className={styles.modalContent4}>
              <Input id={'addOrder'} className={styles.input + ' ' + styles.addOrderInput} 
                base={{value: this.state.addOrderQuery, placeholder: 'Write the EDS here to manually verify...'}}
                type={'text'} onChange={this.stateChange('addOrderQuery')} onEnterKeyPressed={this.addOrder} />
              <div className={styles.modalContentRight}>
                <button className={styles.addOrderButton} onClick={this.addOrder} disabled={this.state.addOrderQuery === ""}>Add</button>
              </div>
              <div style={{clear: 'both'}}></div>
            </div>

            <div className={styles.modalContent1 + ' ' + styles.ordersContent}>
              {
                (!canCreate) &&
                <div className={styles.ordersContentEmpty}>
                  <img src="/img/icon-scan-input.png" width="80" height="80"/>
                  <div className={styles.mediumText}>Waiting for order input</div>
                  <div className={styles.smallText}>Please scan the order that you want to put on this bag/trip 
                    or do it manually by typing the order id on the input box above</div>
                </div>
              }
              {
                (canCreate) &&
                <div>
                  {ordersContent}
                </div>
              }
            </div>
            
            <div className={styles.modalFooter}>
              <div className={styles.modalFooterLeft}>
                <div className={styles.smallText}>
                  {
                    (!canCreate) &&
                    <span>You have not filled this bag / trip with orders.<br/>
                    Please add by scanning or do it manually by typing its order ID.</span>
                  }
                  {
                    (canCreate) &&
                    <span>You have filled this bag / trip with orders.<br/>
                    Please click on this button to continue.</span>
                  }
                </div>
              </div>
              <div className={styles.modalFooterRight}>
                <button className={styles.createTripButton} onClick={this.createTrip}
                  disabled={!canCreate}>Create Trip</button>
              </div>
            </div>
          </div> 
        }   
        { this.state.isSuccessCreating &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Success</h2>
              <div className={styles.successContent + ' ' + styles.ordersContentEmpty}>
                <img className={styles.successIcon} src={"/img/icon-success.png"} />
                <div className={styles.mediumText}>You have successfully created a new trip</div>
                <div className={styles.smallText}>
                  This trip is ready to be dispatch, please dispatch it on the outbound page.
                </div>
                <div className={styles.bigText}>TRIP-ID - {this.props.createdTrip.TripID}</div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.endButton} onClick={this.closeModal} id="gotItButton">
                <span className={styles.mediumText}>Got It</span></button>
            </div>
          </div>
        }
      </ModalDialog>
    )
  }
});

const GroupingPage = React.createClass({
  getInitialState() {
    return {
      findOrderQuery: '',
      showModal: false
    }
  },
  componentDidMount() {
    document.getElementById("prepareBtn").focus();
  },
  componentWillReceiveProps(nextProps) {
    if ((nextProps['isGrouping'])) {
      this.openModal();
    }
    this.setState({
      isSuccessEditing: nextProps['isSuccessEditing']
    });
  },
  openModal() {
    this.setState({showModal: true});
  },
  closeModal() {
    this.setState({showModal: false});
    this.props.doneCreateTrip()
  },
  render() {
    const {isGrouping, total} = this.props;
    return (
      <Page title="GROUPING" count={{itemName: 'Items', done: 'All Done', value: total}}>
        {
          this.state.showModal &&
          <ModalContainer>
            <CreateTripModal {...this.props} onClose={this.closeModal}/>
          </ModalContainer>
        }
        <div className={styles.actionContainer}>
          <button className={styles.createTripButton} onClick={this.openModal} id="prepareBtn">Prepare Bag</button>
        </div>
        <GroupingTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const {grouping, orderDetails} = state.app;
  const {total, isGrouping, trip, addedOrders, isSuccessCreating, createdTrip, duplicateOrders, isDuplicate} = grouping;

  return {
    total,
    isGrouping,
    trip,
    isSuccessCreating,
    addedOrders,
    createdTrip,
    duplicateOrders,
    isDuplicate
  }
}

function mapDispatchToProps (dispatch) {
  return {
    createTrip: function () {
      dispatch(Grouping.CreateTrip());
    },
    doneCreateTrip: function () {
      dispatch(Grouping.DoneCreateTrip());
    },
    addOrder: function (orderQuery, backElementFocusID) {
      dispatch(Grouping.AddOrder(orderQuery, backElementFocusID));
    },
    askRemove: function (modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    removeOrder: function (index) {
      dispatch(Grouping.RemoveOrder(index));
    },
    askClose: function (modal) {
      dispatch(ModalActions.addConfirmation(modal));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupingPage);