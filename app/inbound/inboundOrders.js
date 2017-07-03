import * as _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import PropTypes from 'prop-types';

import InboundOrdersTable from './inboundOrdersTable';
import styles from './styles.scss';
import { Input, Page, Glyph } from '../views/base';
import * as InboundOrders from './inboundOrdersService';
import { ButtonBase } from '../components/button';

const DuplicateModal = React.createClass({
  componentWillUnmount() {
    if (document.getElementById('markReceivedInput')) {
      document.getElementById('markReceivedInput').focus();
    }
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
    const ordersContent = this.props.orders.map((order, index) => {
      const data = (
        <div
          className={styles.orderContent}
          key={index}
          onClick={thisComponent.pickOrder.bind(null, order.UserOrderNumber)}
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
          <img src="/img/icon-close.png" className={styles.closeButtonImage} />
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
  },
});

const PanelSuggestion = React.createClass({
  render() {
    const { nextDestination, lastDestination, successScanned, scannedOrder,
      closeModalMessage, bulkScan, errorIDs, countSuccess, countError,
      isTripID, isInterHub, totalOrderByTrip } = this.props;
    const hideDestination = isTripID && isInterHub;
    return (
      <div className={styles.panelSuggestion}>
        {!bulkScan &&
          <div>
            <div className={styles.scanMessage}>
              <div
                role="button"
                onClick={closeModalMessage}
                className={styles.modalClose}
              >
                X
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
                role="button"
                onClick={closeModalMessage}
                className={styles.modalClose}
              >
                X
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
  },
});

class VerifyButton extends React.Component {
  constructor() {
    super();
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
    totalOrderByTrip } = inboundOrders;

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
  };
}

function mapDispatchToProps(dispatch) {
  return {
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
  };
}

const InboundOrdersPage = React.createClass({
  getInitialState() {
    return {
      orderMarked: '',
      isDuplicate: false,
      opened: true,
      idsRaw: '',
      ids: [],
      idsStart: '',
      showModalMessage: false,
    };
  },
  componentDidMount() {
    document.getElementById('markReceivedInput').focus();
    this.props.resetSuggestion();
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.isDuplicate) {
      this.setState({ isDuplicate: true });
    }
  },
  changeMark(val) {
    this.setState({
      orderMarked: val,
    });
  },
  markReceived(val) {
    if (val === '') {
      return;
    }
    this.props.markReceived(val);
    this.setState({
      orderMarked: '',
      showModalMessage: true,
    });
  },
  closeModal() {
    this.setState({ isDuplicate: false });
  },
  toggleOpen() {
    this.setState({ opened: !this.state.opened, idsStart: this.state.idsRaw });
  },
  cancelChange() {
    this.setState({ opened: true, idsRaw: this.state.idsStart });
  },
  textChange(e) {
    this.setState({ idsRaw: e.target.value });
  },
  processText() {
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    if (IDs.length === 0) {
      alert('Please write EDS Number or Order ID');
      return;
    }
    this.setState({ ids: IDs, showModalMessage: true });
    this.props.bulkMarkReceived(IDs);
  },
  clearText() {
    this.setState({ ids: [], idsRaw: '' });
  },
  closeModalMessage() {
    this.setState({ showModalMessage: false });
  },
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
              role="button"
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
                role="button"
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
          this.state.showModalMessage &&
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
          />
        }
      </Page>
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InboundOrdersPage);
