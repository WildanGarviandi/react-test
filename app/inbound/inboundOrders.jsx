import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import * as _ from 'lodash';
import PropTypes from 'prop-types';

import InboundOrdersTable from './inboundOrdersTable';
import styles from './styles.scss';
import { Input, Page } from '../views/base';
import Glyph from '../components/Glyph';
import * as InboundOrders from './inboundOrdersService';
import { ButtonBase } from '../components/Button';
import config from '../config/configValues.json';

class DuplicateModal extends Component {
  componentWillUnmount() {
    if (document.getElementById('markReceivedInput')) {
      document.getElementById('markReceivedInput').focus();
    }
  }
  closeModal() {
    this.props.closeModal();
  }
  pickOrder(id) {
    this.props.pickOrder(id);
    this.closeModal();
  }
  render() {
    const ordersContent = this.props.orders.map((order) => {
      const data = (
        <div
          role="none"
          className={styles.orderContent}
          key={order.UserOrderNumber}
          onClick={() => this.pickOrder(order.UserOrderNumber)}
        >
          <div className={styles.orderContentLeft}>
            <div className={styles.smallText}>To</div>
            {order.DropoffAddress &&
              <div>
                <div className={styles.bigText}>
                  {`${order.DropoffAddress.FirstName} ${order.DropoffAddress.LastName}`}
                </div>
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
      return data;
    });

    return (
      <ModalDialog>
        <button className={styles.closeModalButton} onClick={this.closeModal}>
          <img alt="close" src="/img/icon-close.png" className={styles.closeButtonImage} />
        </button>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Please pick the right one</h2>
            <div className={styles.smallText}>
              Order <strong>{this.props.orders[0].WebOrderID}</strong>
              was found in more than one data
            </div>
          </div>
          <div className={`${styles.modalContent1} ${styles.ordersContent}`}>
            {ordersContent}
          </div>
        </div>
      </ModalDialog>
    );
  }
}

/* eslint-disable */
DuplicateModal.propTypes = {
  closeModal: PropTypes.func,
  pickOrder: PropTypes.func,
  orders: PropTypes.array,
};
/* eslint-enable */

DuplicateModal.defaultProps = {
  closeModal: () => {},
  pickOrder: () => {},
  orders: [],
};

function PanelSuggestion({
  nextDestination,
  lastDestination,
  successScanned,
  scannedOrder,
  closeModalMessage,
  bulkScan,
  errorIDs,
  countSuccess,
  countError,
  isTripID,
  isInterHub,
  totalOrderByTrip,
}) {
  const hideDestination = isTripID && isInterHub;
  return (
    <div className={styles.panelSuggestion}>
      {!bulkScan &&
        <div>
          <div className={styles.scanMessage}>
            <div
              role="none"
              onClick={closeModalMessage}
              className={styles.modalClose}
            >
              &times;
            </div>
            {
              !hideDestination && (
                <div className={styles.successScanned}>
                  Success: {successScanned}
                </div>
              )
            }
          </div>
          <div className={styles.scannedOrder}>
            {scannedOrder}
          </div>
          {
            !hideDestination && (
              <div>
                <div>
                  {lastDestination.City}
                </div>
                <div className={styles.scannedOrder}>
                  {nextDestination.Hub ? `via Hub ${nextDestination.Hub.Name}` : (nextDestination && 'Dropoff')}
                </div>
                <div className={styles.scannedOrder}>
                  {lastDestination.District && `Kec. ${lastDestination.District}`}
                </div>
                <div className={styles.scannedOrder}>
                  {lastDestination.ZipCode}
                </div>
              </div>
            )
          }
          {
            hideDestination && (
              <div>
                <div className={styles['total-order']}>
                  Trip berhasil diterima: {totalOrderByTrip} order
                </div>
              </div>
            )
          }
        </div>
      }
      {bulkScan &&
        <div>
          <div className={styles.scanMessage}>
            <div
              role="none"
              onClick={closeModalMessage}
              className={styles.modalClose}
            >
              &times;
            </div>
          </div>
          <div className={styles.bulkScanInformation}>
            Success: {countSuccess}, Error: {countError}
          </div>
          {errorIDs.length > 0 &&
            <div className={styles.bulkScanFailed}>
              Error Order: {errorIDs.join(', ')}
            </div>
          }
        </div>
      }
    </div>
  );
}

/* eslint-disable */
PanelSuggestion.propTypes = {
  nextDestination: PropTypes.any,
  lastDestination: PropTypes.any,
  successScanned: PropTypes.any,
  scannedOrder: PropTypes.any,
  closeModalMessage: PropTypes.func,
  bulkScan: PropTypes.bool,
  errorIDs: PropTypes.array,
  countSuccess: PropTypes.number,
  countError: PropTypes.number,
  isTripID: PropTypes.bool,
  isInterHub: PropTypes.bool,
  totalOrderByTrip: PropTypes.number,
};
/* eslint-enable */

PanelSuggestion.defaultProps = {
  nextDestination: {},
  lastDestination: {},
  successScanned: {},
  scannedOrder: {},
  closeModalMessage: () => {},
  bulkScan: false,
  errorIDs: [],
  countSuccess: 0,
  countError: 0,
  isTripID: false,
  isInterHub: false,
  totalOrderByTrip: 0,
};

class VerifyButton extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    this.props.onClick(this.props.orderMarked);
  }
  render() {
    return (
      <button
        onClick={this.onClick}
        className={styles.verifyButton}
        disabled={this.props.orderMarked === ''}
      >
        Verify
      </button>
    );
  }
}

/* eslint-disable */
VerifyButton.propTypes = {
  orderMarked: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired,
};
/* eslint-enable */

function mapStateToProps(state) {
  const { inboundOrders } = state.app;
  const userLogged = state.app.userLogged;
  const { duplicateOrders, isDuplicate, total, suggestion, lastDestination, successScanned,
    scannedOrder, bulkScan, errorIDs, countSuccess, countError, isTripID, isInterHub,
    totalOrderByTrip, misroute } = inboundOrders;

  return {
    userLogged,
    duplicateOrders,
    isDuplicate,
    total,
    suggestion,
    lastDestination,
    scannedOrder,
    successScanned,
    errorIDs,
    countSuccess,
    countError,
    bulkScan,
    isTripID,
    isInterHub,
    totalOrderByTrip,
    misroute,
  };
}

function mapDispatchToProps(dispatch) {
  const dispatchFunc = {
    markReceived: (scannedID) => {
      dispatch(InboundOrders.resetSuggestion());
      dispatch(InboundOrders.markReceived(scannedID));
    },
    bulkMarkReceived: (scannedIDs) => {
      dispatch(InboundOrders.BulkMarkReceived(scannedIDs));
    },
    resetSuggestion: () => {
      dispatch(InboundOrders.resetSuggestion());
    },
    closeMisrouteModal: () => {
      dispatch(InboundOrders.setDefault({
        misroute: null,
        lastDestination: {},
      }));
    },
  };

  return dispatchFunc;
}

class MisrouteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rerouted: false,
    };

    this.closeModal = this.closeModal.bind(this);
    this.reRoute = this.reRoute.bind(this);
  }
  componentDidMount() {
    document.getElementById('misrouteModal').focus();
  }
  handleKeyDown(e) {
    if (e.keyCode === config.KEY_ACTION.ENTER) {
      this.reRoute();
    }
    if (e.keyCode === config.KEY_ACTION.ESCAPE) {
      this.closeModal();
    }
  }
  closeModal() {
    this.props.closeModal();
  }
  reRoute() {
    this.setState({
      rerouted: true,
    });
    setTimeout(() => {
      this.props.closeModal();
    }, 800);
  }
  render() {
    return (
      <ModalContainer>
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
                <button className={styles['modal-button-no']} onClick={this.closeModal}>
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
      </ModalContainer>
    );
  }
}

/* eslint-disable */
MisrouteModal.propTypes = {
  closeModal: PropTypes.func,
  orderID: PropTypes.any,
  newDestination: PropTypes.any,
};
/* eslint-enable */

MisrouteModal.defaultProps = {
  closeModal: () => {},
  orderID: '',
  newDestination: '',
};

class InboundOrdersPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderMarked: '',
      isDuplicate: false,
      opened: true,
      idsRaw: '',
      ids: [],
      idsStart: '',
      showModalMessage: false,
    };

    this.markReceived = this.markReceived.bind(this);
    this.changeMark = this.changeMark.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.closeModalMessage = this.closeModalMessage.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.textChange = this.textChange.bind(this);
    this.clearText = this.clearText.bind(this);
    this.cancelChange = this.cancelChange.bind(this);
    this.processText = this.processText.bind(this);
  }
  componentDidMount() {
    document.getElementById('markReceivedInput').focus();
    this.props.resetSuggestion();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isDuplicate) {
      this.setState({ isDuplicate: true });
    }
  }
  changeMark(val) {
    this.setState({
      orderMarked: val,
    });
  }
  markReceived(val) {
    if (val === '') {
      return;
    }
    document.getElementById('markReceivedInput').blur();
    this.props.markReceived(val);
    this.setState({
      orderMarked: '',
      showModalMessage: true,
    });
  }
  closeModal() {
    this.setState({ isDuplicate: false });
  }
  toggleOpen() {
    this.setState({ opened: !this.state.opened, idsStart: this.state.idsRaw });
  }
  cancelChange() {
    this.setState({ opened: true, idsRaw: this.state.idsStart });
  }
  textChange(e) {
    this.setState({ idsRaw: e.target.value });
  }
  processText() {
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    if (IDs.length === 0) {
      alert('Please write EDS Number or Order ID');
      return;
    }
    this.setState({ ids: IDs, showModalMessage: true });
    this.props.bulkMarkReceived(IDs);
  }
  clearText() {
    this.setState({ ids: [], idsRaw: '' });
  }
  closeModalMessage() {
    this.setState({ showModalMessage: false });
  }
  render() {
    const inputVerifyStyles = {
      container: styles.verifyInputContainer,
      input: styles.verifyInput,
    };
    return (
      <Page title="Inbound Orders" count={{ itemName: 'Items', done: 'All Done', value: this.props.total }}>
        {
          this.state.isDuplicate &&
          <ModalContainer onClose={this.closeModal}>
            <DuplicateModal
              orders={this.props.duplicateOrders}
              closeModal={this.closeModal}
              pickOrder={this.test}
            />
          </ModalContainer>
        }
        <div className={styles.actionContainer}>
          <Input
            styles={inputVerifyStyles}
            onChange={this.changeMark}
            onEnterKeyPressed={this.markReceived}
            ref={(c) => { this.markReceivedInput = c; }}
            base={{ value: this.state.orderMarked, placeholder: 'Scan EDS, WebOrderID, or TripID...' }}
            id="markReceivedInput"
          />
          <VerifyButton
            orderMarked={this.state.orderMarked}
            onClick={this.markReceived}
          />
        </div>
        <div style={{ clear: 'both' }} />
        <div style={{ marginBottom: 15 }}>
          {this.state.opened ?
            <div
              role="none"
              className={styles.top2}
              onClick={this.toggleOpen}
            >
              <h4 className={styles.title}>
                <Glyph name="chevron-down" className={styles.glyphFilter} />
                {(this.state.ids.length ? `Scan multiple orders (${this.state.ids.length} keywords)` :
                  'Scan multiple orders')}
              </h4>
            </div> :
            <div className={styles.panel}>
              <div
                role="none"
                className={styles.top2}
                onClick={this.toggleOpen}
              >
                <h4 className={styles.title}>
                  <Glyph name="chevron-up" className={styles.glyphFilter} />
                  {'Scan multiple orders:'}
                </h4>
              </div>
              <div className={styles.bottom}>
                <textarea
                  className={styles.textArea}
                  value={this.state.idsRaw}
                  onChange={this.textChange}
                  placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'}
                />
                <ButtonBase
                  styles={styles.greenButton}
                  onClick={this.processText}
                >
                  Scan
                </ButtonBase>
                <ButtonBase
                  styles={styles.redButton}
                  onClick={this.cancelChange}
                >
                  Cancel
                </ButtonBase>
                <ButtonBase
                  styles={styles.redButton}
                  onClick={this.clearText}
                >
                  Clear
                </ButtonBase>
              </div>
            </div>
          }
        </div>
        <InboundOrdersTable />
        {
          (!_.isEmpty(this.props.lastDestination) || this.props.bulkScan) &&
          this.state.showModalMessage && !this.props.misroute &&
          <PanelSuggestion
            closeModalMessage={this.closeModalMessage}
            nextDestination={this.props.suggestion}
            lastDestination={this.props.lastDestination}
            successScanned={this.props.successScanned}
            scannedOrder={this.props.scannedOrder}
            bulkScan={this.props.bulkScan}
            errorIDs={this.props.errorIDs}
            countSuccess={this.props.countSuccess}
            countError={this.props.countError}
            isTripID={this.props.isTripID}
            isInterHub={this.props.isInterHub}
            totalOrderByTrip={this.props.totalOrderByTrip}
            misroute={this.props.misroute}
          />
        }
        {this.props.misroute &&
          <MisrouteModal
            closeModal={this.props.closeMisrouteModal}
            orderID={this.props.misroute}
          />
        }
      </Page>
    );
  }
}

/* eslint-disable */
InboundOrdersPage.propTypes = {
  resetSuggestion: PropTypes.func,
  isDuplicate: PropTypes.bool,
  markReceived: PropTypes.func,
  bulkMarkReceived: PropTypes.func,
  duplicateOrders: PropTypes.array,
  lastDestination: PropTypes.any,
  suggestion: PropTypes.any,
  successScanned: PropTypes.number,
  scannedOrder: PropTypes.any,
  bulkScan: PropTypes.bool,
  errorIDs: PropTypes.array,
  countSuccess: PropTypes.number,
  countError: PropTypes.number,
  isTripID: PropTypes.bool,
  isInterHub: PropTypes.bool,
  totalOrderByTrip: PropTypes.number,
  misroute: PropTypes.any,
  closeMisrouteModal: PropTypes.func,
  total: PropTypes.number,
};
/* eslint-enable */

InboundOrdersPage.defaultProps = {
  resetSuggestion: () => {},
  isDuplicate: false,
  markReceived: () => {},
  bulkMarkReceived: () => {},
  duplicateOrders: [],
  lastDestination: {},
  suggestion: {},
  successScanned: 0,
  scannedOrder: '',
  bulkScan: false,
  errorIDs: [],
  countSuccess: 0,
  countError: 0,
  isTripID: false,
  isInterHub: false,
  totalOrderByTrip: 0,
  misroute: null,
  closeMisrouteModal: () => {},
  total: 0,
};

export default connect(mapStateToProps, mapDispatchToProps)(InboundOrdersPage);
