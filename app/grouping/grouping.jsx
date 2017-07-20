import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import PropTypes from 'prop-types';

import GroupingTable from './groupingTable';
import styles from './styles.scss';
import { Input, Page } from '../views/base';
import * as Grouping from './groupingService';
import ModalActions from '../modules/modals/actions';
import config from '../config/configValues.json';

class CreateTripModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addOrderQuery: '',
      orders: this.props.addedOrders || [],
      isSuccessCreating: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createTrip = this.createTrip.bind(this);
    this.addOrder = this.addOrder.bind(this);
  }
  componentDidMount() {
    document.getElementById('addOrder') && document.getElementById('addOrder').focus();
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.isDuplicate && !nextProps.isSuccessCreating) {
      document.getElementById('addOrder') && document.getElementById('addOrder').focus();
    }

    this.setState({
      orders: nextProps.addedOrders,
      isSuccessCreating: nextProps.isSuccessCreating,
    });
  }
  componentDidUpdate() {
    if (this.state.isSuccessCreating) {
      document.getElementById('gotItButton') && document.getElementById('gotItButton').focus();
    }
  }
  componentWillUnmount() {
    document.getElementById('prepareBtn') && document.getElementById('prepareBtn').focus();
  }
  handleInputChange(key) {
    return (value) => {
      this.setState({ [key]: value });
    };
  }
  closeModal() {
    const thisClass = this;
    function close() {
      thisClass.setState({
        trip: {},
        orders: [],
      });
      thisClass.props.onClose();
    }
    if (this.state.orders.length > 0) {
      this.props.askClose({
        message: 'Are you sure to close? Your changes will be lost.',
        action: () => {
          close();
        },
        backElementFocusID: 'addOrder',
      });
    } else {
      close();
    }
  }
  createTrip() {
    this.props.createTrip();
  }
  confirmSuccess() { // potential not used
    this.closeModal();
  }
  addOrder() {
    if (this.state.addOrderQuery === '') {
      return;
    }
    this.setState({ addOrderQueryCopy: this.state.addOrderQuery });
    this.setState({ addOrderQuery: '' });
    this.props.addOrder(this.state.addOrderQuery, 'addOrder');
  }
  chooseOrder(val) {
    this.props.addOrder(val, 'addOrder');
  }
  render() {
    const { isDuplicate, duplicateOrders } = this.props;
    const canCreate = this.state.orders.length > 0;
    let totalWeight = 0;
    let duplicateOrdersContent = [];
    const ordersContent = this.state.orders.map((order) => {
      totalWeight += order.PackageWeight;
      return (
        <div className={styles.orderContent} key={order.UserOrderID}>
          <div className={styles.orderContentLeft}>
            <div className={styles.smallText}>To</div>
            {order.DropoffAddress &&
              <div>
                <div className={styles.mediumText}>{`${order.DropoffAddress.FirstName} ${order.DropoffAddress.LastName}`}</div>
                <div className={styles.smallText}>
                  {`${order.DropoffAddress.Address1}, ${order.DropoffAddress.Address2}, ${order.DropoffAddress.City}, ${order.DropoffAddress.ZipCode}`}
                </div>
              </div>
            }
          </div>
          <div className={styles.orderContentRight}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.smallTextBold}>{order.UserOrderNumber}</div>
              <div className={styles.smallTextBold}>({order.WebOrderID})</div>
            </div>
          </div>
        </div>
      );
    });

    if (isDuplicate) {
      duplicateOrdersContent = duplicateOrders.map((order) => {
        return (
          <div
            role="none"
            className={`${styles.orderContent} ${styles.orderContentHover}`}
            key={order.UserOrderID}
            onClick={() => this.chooseOrder(order.UserOrderNumber)}
          >
            <div className={styles.orderContentLeft}>
              <div className={styles.smallText}>To</div>
              {order.DropoffAddress &&
                <div>
                  <div className={styles.bigText}>{`${order.DropoffAddress.FirstName} ${order.DropoffAddress.LastName}`}</div>
                  <div className={styles.mediumText}>{order.DropoffAddress.City}</div>
                </div>
              }
            </div>
            <div className={styles.orderContentRight}>
              <div style={{ textAlign: 'center' }}>
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
        {isDuplicate &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Please pick the right one</h2>
              <div className={styles.smallText}>
                Order
                 <strong>{this.state.addOrderQueryCopy}</strong>
                 was found in more than one data
              </div>
            </div>
            <div className={`${styles.modalContent1} ${styles.ordersContent}`}>
              {duplicateOrdersContent}
            </div>
          </div>
        }
        {!this.state.isSuccessCreating && !isDuplicate &&
          <div className={styles.modal}>
            <button className={styles.closeModalButton} onClick={this.closeModal}>
              <img alt="close" src="/img/icon-close.png" className={styles.closeButtonImage} /></button>
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
                <div style={{ clear: 'both' }} />
              </div>
            </div>

            <div className={styles.modalContent4}>
              <Input
                id={'addOrder'}
                className={`${styles.input} ${styles.addOrderInput}`}
                base={{ value: this.state.addOrderQuery, placeholder: 'Write the EDS here to manually verify...' }}
                type={'text'}
                onChange={this.handleInputChange('addOrderQuery')}
                onEnterKeyPressed={this.addOrder}
              />
              <div className={styles.modalContentRight}>
                <button className={styles.addOrderButton} onClick={this.addOrder} disabled={this.state.addOrderQuery === ''}>Add</button>
              </div>
              <div style={{ clear: 'both' }} />
            </div>

            <div className={`${styles.modalContent1} ${styles.ordersContent}`}>
              {
                (!canCreate) &&
                <div className={styles.ordersContentEmpty}>
                  <img alt="scan input" src="/img/icon-scan-input.png" width="80" height="80" />
                  <div className={styles.mediumText}>Waiting for order input</div>
                  <div className={styles.smallText}>
                    Please scan the order that you want to put on this bag/trip
                    or do it manually by typing the order id on the input box above
                  </div>
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
                    <span>You have not filled this bag / trip with orders.<br />
                      Please add by scanning or do it manually by typing its order ID.</span>
                  }
                  {
                    (canCreate) &&
                    <span>You have filled this bag / trip with orders.<br />
                      Please click on this button to continue.</span>
                  }
                </div>
              </div>
              <div className={styles.modalFooterRight}>
                <button
                  className={styles.createTripButton}
                  onClick={this.createTrip}
                  disabled={!canCreate}
                >
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        }
        {this.state.isSuccessCreating &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Success</h2>
              <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
                <img alt="success" className={styles.successIcon} src={'/img/icon-success.png'} />
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
    );
  }
}

/* eslint-disable */
CreateTripModal.propTypes = {
  addedOrders: PropTypes.array,
  isDuplicate: PropTypes.bool,
  isSuccessCreating: PropTypes.bool,
  askClose: PropTypes.func,
  createTrip: PropTypes.func,
  addOrder: PropTypes.func,
  duplicateOrders: PropTypes.array,
  createdTrip: PropTypes.any,
}
/* eslint-enable */

CreateTripModal.defaultProps = {
  addedOrders: [],
  isDuplicate: false,
  isSuccessCreating: false,
  askClose: () => {},
  createTrip: () => {},
  addOrder: () => {},
  duplicateOrders: [],
  createdTrip: {},
};

class MisrouteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rerouted: false,
    };

    this.hideContent = this.hideContent.bind(this);
    this.reRoute = this.reRoute.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  componentDidMount() {
    document.getElementById('misrouteModal').focus();
  }
  handleKeyDown(e) {
    if (e.keyCode === config.KEY_ACTION.ENTER) {
      this.reRoute();
    }
    if (e.keyCode === config.KEY_ACTION.ESCAPE) {
      this.hideContent();
    }
  }
  hideContent() {
    this.props.hideContent();
  }
  closeModal() {
    this.props.closeModal();
    this.props.hideContent();
  }
  reRoute() {
    this.setState({
      rerouted: true,
    });
    setTimeout(() => {
      this.closeModal();
    }, 800);
  }
  render() {
    return (
      <ModalDialog>
        {!this.state.rerouted &&
          <div role="button" id="misrouteModal" tabIndex="0" className={styles.modal} onKeyDown={e => this.handleKeyDown(e)}>
            <div className={styles.modalHeader}>
              <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
                <img className={styles.successIcon} src={config.IMAGES.ICON_NOT_READY} alt="not ready" />
                <div className={styles.mediumText}>
                  Order {this.props.orderID} is misroute.
                  Would you like to reroute the order?
                </div>
              </div>
            </div>
            <div className={styles['modal-footer']}>
              <button className={styles['modal-button-no']} onClick={this.hideContent}>
                No
              </button>
              <button className={styles['modal-button-yes']} onClick={this.reRoute}>
                Yes
              </button>
            </div>
          </div>
        }
        {this.state.rerouted &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
                <img className={styles.successIcon} src={config.IMAGES.ICON_SUCCESS} alt="success" />
                <div className={styles.mediumText}>
                  Order {this.props.orderID} successfully moved to {this.props.newDestination}
                </div>
              </div>
            </div>
          </div>
        }
      </ModalDialog>
    );
  }
}

/* eslint-disable */
MisrouteModal.propTypes = {
  orderID: PropTypes.any,
  newDestination: PropTypes.any,
  closeModal: PropTypes.func,
  hideContent: PropTypes.func,
};
/* eslint-enable */

MisrouteModal.defaultProps = {
  orderID: '',
  newDestination: '',
  closeModal: () => {},
  hideContent: () => {},
};

function mapStateToProps(state) {
  const { grouping } = state.app;
  const {
    total,
    isGrouping,
    trip,
    addedOrders,
    isSuccessCreating,
    createdTrip,
    duplicateOrders,
    isDuplicate,
    misroute,
  } = grouping;

  return {
    total,
    isGrouping,
    trip,
    isSuccessCreating,
    addedOrders,
    createdTrip,
    duplicateOrders,
    isDuplicate,
    misroute,
  };
}

function mapDispatchToProps(dispatch) {
  const dispatchFunc = {
    createTrip: () => {
      dispatch(Grouping.CreateTrip());
    },
    doneCreateTrip: () => {
      dispatch(Grouping.DoneCreateTrip());
    },
    addOrder: (orderQuery, backElementFocusID) => {
      dispatch(Grouping.AddOrder(orderQuery, backElementFocusID));
    },
    askRemove: (modal) => {
      dispatch(ModalActions.addConfirmation(modal));
    },
    removeOrder: (index) => {
      dispatch(Grouping.RemoveOrder(index));
    },
    askClose: (modal) => {
      dispatch(ModalActions.addConfirmation(modal));
    },
    hideMisrouteContent: () => {
      dispatch(Grouping.setDefault({ misroute: null }));
    },
  };

  return dispatchFunc;
}

class GroupingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      findOrderQuery: '',
      showModal: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  componentDidMount() {
    document.getElementById('prepareBtn').focus();
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.isGrouping)) {
      this.openModal();
    }
    this.setState({
      isSuccessEditing: nextProps.isSuccessEditing,
    });
  }
  openModal() {
    this.setState({ showModal: true });
  }
  closeModal() {
    this.setState({ showModal: false });
    this.props.doneCreateTrip();
  }
  handleModalContent() {
    if (this.props.misroute) {
      return (
        <MisrouteModal
          hideContent={this.props.hideMisrouteContent}
          closeModal={this.closeModal}
        />
      );
    }
    return <CreateTripModal {...this.props} onClose={this.closeModal} />;
  }
  render() {
    const { total } = this.props;
    return (
      <Page title="GROUPING" count={{ itemName: 'Items', done: 'All Done', value: total }}>
        {
          this.state.showModal &&
          <ModalContainer>
            {this.handleModalContent()}
          </ModalContainer>
        }
        <div className={styles.actionContainer}>
          <button className={styles.createTripButton} onClick={this.openModal} id="prepareBtn">Prepare Bag</button>
        </div>
        <GroupingTable />
      </Page>
    );
  }
}

/* eslint-disable */
GroupingPage.propTypes = {
  isGrouping: PropTypes.bool,
  isSuccessEditing: PropTypes.bool,
  doneCreateTrip: PropTypes.func,
  total: PropTypes.number,
  misroute: PropTypes.any,
  hideMisrouteContent: PropTypes.func,
}
/* eslint-enable */

GroupingPage.defaultProps = {
  isGrouping: false,
  isSuccessEditing: false,
  doneCreateTrip: () => {},
  total: 0,
  misroute: null,
  hideMisrouteContent: () => {},
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupingPage);
