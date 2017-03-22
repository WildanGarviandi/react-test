import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import InboundOrdersTable from './inboundOrdersTable';
import styles from './styles.css';
import {ButtonWithLoading, Input, Page} from '../views/base';
import * as InboundOrders from './inboundOrdersService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Glyph} from '../views/base';
import {ButtonBase} from '../components/button';

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
          <img src="/img/icon-close.png" className={styles.closeButtonImage}/>
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
      isDuplicate: false,
      opened: true,
      idsRaw: '',
      ids: [],
      idsStart: ''
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
  toggleOpen() {
    this.setState({opened: !this.state.opened, idsStart: this.state.idsRaw});
  },
  cancelChange() {
    this.setState({opened: true, idsRaw: this.state.idsStart});
  },
  textChange(e) {
    this.setState({idsRaw: e.target.value});
  },
  processText() {
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    if (IDs.length === 0) {
        alert('Please write EDS Number or Order ID');
        return;
    }
    this.setState({ids: IDs});
    this.props.bulkMarkReceived(IDs);
  },
  clearText() {
    const {filterAction} = this.props;
    this.setState({ids: [], idsRaw: ''});
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
        <div style={{clear: 'both'}} />
        <div style={{marginBottom: 15}}>
          { this.state.opened ?
            <div className={styles.top2} onClick={this.toggleOpen}>
              <h4 className={styles.title}>
                <Glyph name='chevron-down' className={styles.glyphFilter} />
                {(this.state.ids.length ? 'Search multiple orders (' + this.state.ids.length + ' keywords)' : 'Search multiple orders')}
              </h4>
            </div> :
            <div className={styles.panel}>
              <div className={styles.top2} onClick={this.toggleOpen}>
                <h4 className={styles.title}>
                  <Glyph name='chevron-up' className={styles.glyphFilter} />
                  {'Search multiple orders:'}
                </h4>
              </div>
              <div className={styles.bottom}>
                <textarea 
                    className={styles.textArea} 
                    value={this.state.idsRaw} 
                    onChange={this.textChange} 
                    placeholder={'Write/Paste EDS Number or Order ID here, separated with newline'} />
                <ButtonBase styles={styles.greenButton} onClick={this.processText}>Filter</ButtonBase>
                <ButtonBase styles={styles.redButton} onClick={this.cancelChange}>Cancel</ButtonBase>
                <ButtonBase styles={styles.redButton} onClick={this.clearText}>Clear</ButtonBase>
              </div>
            </div>
          }
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
    },
    bulkMarkReceived: function(scannedIDs) {
      dispatch(InboundOrders.BulkMarkReceived(scannedIDs));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InboundOrdersPage);