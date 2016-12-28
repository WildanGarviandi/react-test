import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import UpdateOrdersTable from './updateOrdersTable';
import styles from '../views/order/styles.css';
import updateStyles from './styles.css';
import {ButtonWithLoading, Input, Page, InputWithDefault} from '../views/base';
import * as UpdateOrders from './updateOrdersService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import * as OrdersDetails from '../modules/orders/actions/details';
import ReactDOM from 'react-dom';

const InputRow = React.createClass({
  getInitialState() {
    return {
      hover: false
    };
  },
  onMouseEnterHandler: function() {
    this.setState({
      hover: true
    });
  },
  onMouseLeaveHandler: function() {
    this.setState({
      hover: false
    });
  },
  handleEnter: function () {
    this.props.onEnterKeyPressed();
  },
  handleSelect: function () {

  },
  render() {
    const {isEditing, label, value, onChange, type, icon, id} = this.props;
    let stylesLabel = styles.itemLabelHover;
    let stylesValue = styles.itemValueHover;

    return (
      <div className={updateStyles.modalContent3}>
        <div className={updateStyles.smallText}>{label}</div>
        <InputWithDefault id={id} className={updateStyles.input} currentText={value} type={type} onChange={this.props.onChange}
          handleSelect={this.handleSelect} handleEnter={this.handleEnter} />
      </div>
    );
  }
});

const UpdateModal = React.createClass({
  getInitialState() {
    return {
      scannedOrder: this.props.scannedOrder || {},
      PackageWidth: this.props.scannedOrder.PackageWidth,
      PackageHeight: this.props.scannedOrder.PackageHeight,
      PackageLength: this.props.scannedOrder.PackageLength,
      DeliveryFee: this.props.scannedOrder.OrderCost,
      editDelivery: false
    }
  },
  stateChange(key) {
    return (value) => {
      this.setState({[key]: value});
    };
  },
  componentWillReceiveProps(nextProps) {
    if ((nextProps['isEditing'])) {
      if (document.getElementById('packageLength')) {
        document.getElementById('packageLength').focus();
      }
    }
    if (this.state.scannedOrder.UserOrderID !== nextProps.scannedOrder) {
      this.setState({
        scannedOrder: nextProps['scannedOrder'],
        PackageWidth: nextProps['scannedOrder'].PackageWidth,
        PackageHeight: nextProps['scannedOrder'].PackageHeight,
        PackageLength: nextProps['scannedOrder'].PackageLength,
        PackageWeight: nextProps['scannedOrder'].PackageWeight,
        DeliveryFee: nextProps['scannedOrder'].OrderCost
      });
    }
    this.setState({
      isSuccessEditing: nextProps['isSuccessEditing']
    });
  },
  closeModal() {
    this.setState({showModal: false, scannedOrder: {}});    
    this.props.StopEditOrder();
  },
  updateOrder() {
    let updatedFields = ['PackageLength', 'PackageHeight', 'PackageWidth', 'PackageWeight', 'DeliveryFee'];
    let currentData = lodash.assign({}, this.state);
    let updatedData = {}
    updatedFields.forEach(function(field) {
      if (typeof currentData[field] !== 'undefined') {
        updatedData[field] = parseInt(currentData[field]);
      } 
    });
    this.props.UpdateOrder(this.props.scannedOrder.UserOrderID, updatedData);
  },
  confirmSuccess() {
    this.closeModal();
    this.props.revertSuccessEditing();
  },
  editDelivery() {
    this.setState({
      editDelivery: true
    })
  },
  saveDelivery() {
    this.setState({
      editDelivery: false
    });
  },
  render() {
    const scannedOrder = this.state.scannedOrder;
    return (
      <ModalDialog onClose={this.closeModal}>
        { !this.state.isSuccessEditing &&
          <div className={updateStyles.modal}>
            <div className={updateStyles.modalHeader}>
              <h2 className={updateStyles.modalTitle}>{scannedOrder.UserOrderNumber} ({scannedOrder.WebOrderID})</h2>
              <div className={updateStyles.modalInfo}>
                <div style={{float: 'left'}}>
                  <div className={updateStyles.smallText}>From</div>
                  <h2 className={updateStyles.bigText}>{scannedOrder.WebstoreName}</h2>
                </div>
                <div style={{float: 'right', textAlign: 'right'}}>
                  <div className={updateStyles.smallText}>Destination Area</div>
                  <h2 className={updateStyles.bigText}>{scannedOrder.DropoffCity}</h2>
                </div>
                <div style={{clear: 'both'}}></div>
              </div>
            </div>

            <div className={updateStyles.modalContent1}>
              <span style={{fontWeight: '800', float: 'left', fontSize: 10, marginLeft: 20, marginTop: -3}}>RE-MEASUREMENT</span>
              <span style={{fontSize: 10, float: 'right', marginRight: 20}}>Press Enter after you edit the measurement for fast edit</span>
              <div style={{clear: 'both'}}></div>
              <InputRow id={'packageLength'} label={'Length (cm)'} icon={'icon-volume'} value={scannedOrder.PackageLength} 
                type={'text'} onChange={this.stateChange('PackageLength')} onEnterKeyPressed={this.updateOrder} />
              <InputRow id={'packageWidth'} label={'Width (cm)'} icon={'icon-volume'} value={scannedOrder.PackageWidth} 
                type={'text'} onChange={this.stateChange('PackageWidth')} onEnterKeyPressed={this.updateOrder} />
              <InputRow id={'packageHeight'} label={'Height (cm)'} icon={'icon-volume'} value={scannedOrder.PackageHeight} 
                type={'text'} onChange={this.stateChange('PackageHeight')} onEnterKeyPressed={this.updateOrder} />
              <InputRow label={'Weight (kg)'} icon={'icon-weight'} value={scannedOrder.PackageWeight} 
                type={'text'} onChange={this.stateChange('PackageWeight')} onEnterKeyPressed={this.updateOrder} />
            </div>

            <div className={updateStyles.modalContent2}>
              <div style={{float: 'left'}}>
                <div className={updateStyles.smallText}>Volume Weight</div>
                <h2 className={updateStyles.bigText}>
                {((this.state.PackageLength * this.state.PackageWidth * this.state.PackageHeight) / 6000).toFixed(1)} kg</h2>
              </div>
              <div style={{float: 'right'}}>
                <div className={updateStyles.smallestText}>
                  Automatically calculated based on the length, width, and height above</div>
              </div>
              <div style={{clear: 'both', height: 20}}></div>

              <div style={{float: 'left'}}>
                <div className={updateStyles.smallText}>Delivery Fee</div>
                { !this.state.editDelivery && 
                  <h2 className={updateStyles.bigText}>Rp. {scannedOrder.OrderCost}</h2>
                }
                { this.state.editDelivery &&
                  <span>
                    <span className={updateStyles.bigText}>Rp. </span>
                    <InputWithDefault id={'deliveryFee'} className={updateStyles.input + ' ' + updateStyles.inputWithBorder} currentText={scannedOrder.OrderCost} 
                      type={'text'} onChange={this.stateChange('DeliveryFee')} onEnterKeyPressed={this.updateOrder} />
                  </span>
                }
              </div>
              <div style={{float:'right'}}>
                { !this.state.editDelivery &&
                  <button className={updateStyles.normalButton} onClick={this.editDelivery}>EDIT</button>
                }
                { this.state.editDelivery &&
                  <button className={updateStyles.normalButton} onClick={this.saveDelivery}>SAVE</button>
                }
              </div>
              <div style={{clear: 'both'}}></div>
            </div>
            
            <div className={updateStyles.modalFooter}>
              <button className={updateStyles.saveButton} onClick={this.updateOrder}>Update</button>
            </div>
          </div> 
        }   
        { this.state.isSuccessEditing &&
          <div>
            <img className={styles.successIcon} src={"/img/icon-success.png"} />
            <div className={styles.updateSuccess}>
              Update Order Success
            </div> 
            <button className={styles.saveButton} onClick={this.confirmSuccess}>OK</button>
          </div>
        }
      </ModalDialog>
    )
  }
});

const UpdateOrdersPage = React.createClass({
  getInitialState() {
    return {
      findOrderQuery: '',
      showModal: false,
      scannedOrder: this.props.scannedOrder || {}
    }
  },
  changeFindOrder(val) {
    this.setState({
      findOrderQuery: val,
    })
  },
  findOrder(val) {
    this.props.findOrder(this.state.findOrderQuery);
    this.setState({
      findOrderQuery: "",
    });
  },
  componentWillReceiveProps(nextProps) {
    if ((nextProps['isEditing'])) {
      this.openModal();
    }
    if (this.state.scannedOrder.UserOrderID !== nextProps.scannedOrder) {
      this.setState({
        scannedOrder: nextProps['scannedOrder']
      });
    }
    this.setState({
      isSuccessEditing: nextProps['isSuccessEditing']
    });
  },
  openModal() {
    this.setState({
      showModal: true
    });
  },
  closeModal() {
    this.setState({showModal: false, scannedOrder: {}});    
    this.props.StopEditOrder();
  },
  render() {
    const {isEditing} = this.props;
    const inputVerifyStyles = {
      container: styles.verifyInputContainer,
      input: styles.verifyInput
    };
    const scannedOrder = this.state.scannedOrder;
    return (
      <Page title="Update Orders" count={{itemName: 'Items', done: 'All Done', value: this.props.total}}>
        {
          this.state.showModal && isEditing &&
          <ModalContainer onClose={this.closeModal}>
            <UpdateModal {...this.props} order={scannedOrder}/>
          </ModalContainer>
        }
        <div className={styles.verifyContainer}>
          <Input styles={inputVerifyStyles} onChange={this.changeFindOrder} onEnterKeyPressed={this.findOrder} ref="findOrder" 
            base={{value: this.state.findOrderQuery}} id="findOrder" 
            placeholder={'Write the web order ID or EDS/AWB here to update it manually....'} />
          <div onClick={this.submitReceived} className={styles.verifyButton}>Submit</div>
        </div>
        <UpdateOrdersTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const {updateOrders, orderDetails} = state.app;
  const userLogged = state.app.userLogged;
  const {total, isEditing, scannedOrder} = updateOrders;
  const isSuccessEditing = orderDetails.isSuccessEditing;

  return {
    userLogged,
    total,
    isEditing,
    scannedOrder,
    isSuccessEditing
  }
}

function mapDispatchToProps (dispatch) {
  return {
    UpdateOrder: function(id, order){
      dispatch(OrdersDetails.editOrder(id, order, true));
    },
    StopEditOrder: function() {
      dispatch(UpdateOrders.StopEditOrder());
    },
    revertSuccessEditing: function() {
      dispatch(OrdersDetails.revertSuccessEditing());
    },
    findOrder: function(query) {
      dispatch(UpdateOrders.StartEditOrder(query));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrdersPage);