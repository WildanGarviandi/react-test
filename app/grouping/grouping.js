import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import GroupingTable from './groupingTable';
import groupingStyles from './styles.css';
import {ButtonWithLoading, Input, Page, InputWithDefault} from '../views/base';
import * as Grouping from './groupingService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import ReactDOM from 'react-dom';
import ModalActions from '../modules/modals/actions';

const CreateTripModal = React.createClass({
  getInitialState() {
    return {
      addOrderQuery: '',
      orders: this.props.addedOrders,
      isSuccessCreating: false
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
        action: close,
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
    const thisClass = this;
    const index = lodash.findIndex(this.state.orders, {'UserOrderNumber': this.state.addOrderQuery});
    if (index > -1) {
      this.props.askRemove({
        message: `Remove order ${this.state.addOrderQuery} ?`,
        action: function () {
          thisClass.props.removeOrder(index);
        },
        backElementFocusID: 'addOrder'
      });
    } else {
      this.props.addOrder(this.state.addOrderQuery, 'addOrder');
    }
    this.setState({
      addOrderQuery: ''
    })
  },
  componentWillUnmount() {
    this.closeModal();
    document.getElementById("prepareBtn") && document.getElementById("prepareBtn").focus();
  },
  render() {
    const {createdTrip} = this.props;
    const canCreate = this.state.orders.length > 0;
    var totalWeight = 0;

    const ordersContent = this.state.orders.map(function (order, index) {
      totalWeight += order.PackageWeight;
      return (
        <div className={groupingStyles.orderContent} key={index}>
          <div className={groupingStyles.orderContentLeft}>
            <div className={groupingStyles.smallText}>To</div>
            { order.DropoffAddress &&
              <div>
                <div className={groupingStyles.mediumText}>{order.DropoffAddress.FirstName + ' ' + order.DropoffAddress.LastName}</div>
                <div className={groupingStyles.smallText}>
                  {order.DropoffAddress.Address1 + ', ' + order.DropoffAddress.Address2 + ', ' + order.DropoffAddress.City + ', ' +
                    order.DropoffAddress.ZipCode}
                </div>
              </div>
            }
          </div>
          <div className={groupingStyles.orderContentRight}>
            <div style={{textAlign: 'center'}}>
              <div className={groupingStyles.smallTextBold}>{order.UserOrderNumber}</div>
              <div className={groupingStyles.smallTextBold}>({order.WebOrderID})</div>
            </div>
          </div>
        </div>
      );
    });

    return (
      <ModalDialog>
        <button className={groupingStyles.closeModalButton} onClick={this.closeModal}>
          <img src="/img/icon-close.png" className={groupingStyles.closeButtonImage}/></button>
        { !this.state.isSuccessCreating &&
          <div className={groupingStyles.modal}>
            <div className={groupingStyles.modalHeader}>
              <h2 className={groupingStyles.modalTitle}>Add Orders to Bag</h2>
              <div className={groupingStyles.modalInfo}>
                <div className={groupingStyles.orderContentLeft}>
                  <div className={groupingStyles.smallText}>Total Orders</div>
                  <h2 className={groupingStyles.veryBigText}>{this.state.orders.length}</h2>
                </div>
                <div className={groupingStyles.orderContentRight}>
                  <div className={groupingStyles.smallText}>Total Weight (kg)</div>
                  <h2 className={groupingStyles.veryBigText}>{totalWeight}</h2>
                </div>
                <div style={{clear: 'both'}}></div>
              </div>
            </div>

            <div className={groupingStyles.modalContent4}>
              <Input id={'addOrder'} className={groupingStyles.input + ' ' + groupingStyles.addOrderInput} 
                placeholder={'Write the EDS here to manually verify...'} base={{value: this.state.addOrderQuery}}
                type={'text'} onChange={this.stateChange('addOrderQuery')} onEnterKeyPressed={this.addOrder} />
              <div className={groupingStyles.modalContentRight}>
                <button className={groupingStyles.addOrderButton} onClick={this.addOrder}>Add</button>
              </div>
              <div style={{clear: 'both'}}></div>
            </div>

            <div className={groupingStyles.modalContent1 + ' ' + groupingStyles.ordersContent}>
              {
                (!canCreate) &&
                <div className={groupingStyles.ordersContentEmpty}>
                  <img src="/img/icon-scan-input.png" width="80" height="80"/>
                  <div className={groupingStyles.mediumText}>Waiting for order input</div>
                  <div className={groupingStyles.smallText}>Please scan the order that you want to put on this bag/trip 
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
            
            <div className={groupingStyles.modalFooter}>
              <div className={groupingStyles.modalFooterLeft}>
                <div className={groupingStyles.smallText}>
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
              <div className={groupingStyles.modalFooterRight}>
                <button className={groupingStyles.createTripButton} onClick={this.createTrip}
                  disabled={!canCreate}>Create Trip</button>
              </div>
            </div>
          </div> 
        }   
        { this.state.isSuccessCreating &&
          <div className={groupingStyles.modal}>
            <div className={groupingStyles.modalHeader}>
              <h2 className={groupingStyles.modalTitle}>Success</h2>
              <div className={groupingStyles.successContent + ' ' + groupingStyles.ordersContentEmpty}>
                <img className={groupingStyles.successIcon} src={"/img/icon-success.png"} />
                <div className={groupingStyles.mediumText}>You have successfully created a new trip</div>
                <div className={groupingStyles.smallText}>
                  This trip is ready to be dispatch, please dispatch it on the outbound page.
                </div>
                <div className={groupingStyles.bigText}>TRIP-ID - {this.props.createdTrip.TripID}</div>
              </div>
            </div>
            <div className={groupingStyles.modalFooter}>
              <button className={groupingStyles.endButton} onClick={this.closeModal} id="gotItButton">
                <span className={groupingStyles.mediumText}>Got It</span></button>
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
          <ModalContainer onClose={this.closeModal}>
            <CreateTripModal {...this.props} onClose={this.closeModal}/>
          </ModalContainer>
        }
        <div className={groupingStyles.actionContainer}>
          <button className={groupingStyles.createTripButton} onClick={this.openModal} id="prepareBtn">Prepare Bag</button>
        </div>
        <GroupingTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const {grouping, orderDetails} = state.app;
  const {total, isGrouping, trip, addedOrders, isSuccessCreating, createdTrip} = grouping;

  return {
    total,
    isGrouping,
    trip,
    isSuccessCreating,
    addedOrders,
    createdTrip
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