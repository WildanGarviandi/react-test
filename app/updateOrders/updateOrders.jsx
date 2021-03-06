import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import UpdateOrdersTable from './updateOrdersTable';
import styles from './styles.scss';
import {Input, Page, InputWithDefault, InputWithDefaultNumberFormatted} from '../views/base';
import * as UpdateOrders from './updateOrdersService';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import FontAwesome from 'react-fontawesome';
import config from '../config/configValues.json';
import ModalActions from '../modules/modals/actions';
import NumberFormat from 'react-number-format';

function calculatePricing (pricingData, editedData, isPricingByWeight) {
  const {weight = 0, length = 0, height = 0, width = 0} = editedData;

  if (isPricingByWeight) {
    let volumeWeight = (height * length * width) / config.volumetricFactor;
    volumeWeight = Number(volumeWeight.toFixed(1));
    return (volumeWeight > weight) ? volumeWeight * pricingData : weight * pricingData;
  } else {
    const priceData = pricingData.find((price) => {
      return (weight <= price.weight) && (height <= price.height) && (length <= price.length) && (width <= price.width);
    });
    return (priceData) ? priceData.price : 0;
  }
}

const InputRow = React.createClass({
  getInitialState() {
    return {
      selectedValue: this.props.value
    };
  },
  handleSelect(value) {
    this.setState({selectedValue: value})
    this.props.onChange(value)
  },
  handleInputSelect(text) {
  },
  render() {
    const thisClass = this;
    const {isEditing, label, value, onChange, type, id, width, selectItems, customStyle} = this.props;
    let widthStyle;
    (width === 25) ? widthStyle = styles.modalContent25 :
    (width === 50) ? widthStyle = styles.modalContent50 : widthStyle = styles.modalContent100;

    let radioContent = [];
    if (type === 'select') {
      radioContent = lodash.map(selectItems, (item, index) => {
        return (
          <div style={{flex: (index === 0) ? 0.4 : 0.6 }} key={index} onClick={thisClass.handleSelect.bind(null, item.value)}
            className={styles.radioContainer}>
            <input type="radio" name="select" value={item.value} onChange={thisClass.handleSelect.bind(null, item.value)}
              checked={(this.state.selectedValue === item.value)} className={styles.radioImage} />
            <span className={styles.radioLabel}>{item.label}</span>
          </div>
        );
      });
    }

    return (
      <div className={customStyle + ' ' + styles.inputRowContainer + ' ' + widthStyle}>
        <div className={styles.inputRowLabel}>{label}</div>
        <div className={styles.modalContent3}>
          { type === 'text' &&
            <InputWithDefault id={id} className={styles.input} currentText={value} type={type} onChange={this.props.onChange}
              handleSelect={this.handleInputSelect} handleEnter={this.props.onEnterKeyPressed} />
          }
          { type === 'price' &&
            <InputWithDefaultNumberFormatted format={{thousandSeparator: '.', decimalSeparator: ',', prefix: 'Rp '}} onChange={this.props.onChange} 
              currentText={value} className={styles.input} id={id} handleEnter={this.props.onEnterKeyPressed} />
          }
          { type === 'select' &&
            <div className={styles.selectInput}>
              {radioContent}
            </div>
          }
        </div>
      </div>
    );
  }
});

const UpdateModal = React.createClass({
  getInitialState() {
    return {
      scannedOrder: this.props.scannedOrder || {},
      PackageWidth: this.props.scannedOrder.PackageWidth || '0',
      PackageHeight: this.props.scannedOrder.PackageHeight || '0',
      PackageLength: this.props.scannedOrder.PackageLength || '0',
      PackageWeight: this.props.scannedOrder.PackageWeight || '0',
      TotalValue: this.props.scannedOrder.TotalValue || '0',
      OrderCost: this.props.scannedOrder.OrderCost || '0',
      IsCOD: this.props.scannedOrder.IsCOD,
      editDelivery: false,
      noPricing: false,
      orderCostAutoUpdateDone: false
    }
  },
  stateChange(key, type) {
    return (value) => {
      if (type === 'price') {
        this.setState({[key]: (value !== '') ? parseFloat(value) : '0'});
      } else {
        this.setState({[key]: value});
      }
    };
  },
  stateChangeAndCalculate(key) {
    return (value) => {
      value = value.replace(/,/g, '.');
      this.setState({[key]: (value !== '') ? parseFloat(value) : '0'});
      this.calculatePricing(key, value, this.props.scannedPricing, this.props.isPricingByWeight);
    }
  },
  calculatePricing(key, value, scannedPricing, isPricingByWeight) {
    const editedData = {
      weight: (key === 'PackageWeight') ? parseFloat(value) : parseFloat(this.state.PackageWeight),
      height: (key === 'PackageHeight') ? parseFloat(value) : parseFloat(this.state.PackageHeight),
      length: (key === 'PackageLength') ? parseFloat(value) : parseFloat(this.state.PackageLength),
      width: (key === 'PackageWidth') ? parseFloat(value) : parseFloat(this.state.PackageWidth)
    }
    const orderCost = calculatePricing(scannedPricing, editedData, isPricingByWeight);
    this.setState((orderCost !== 0) ? {OrderCost: parseFloat(Number(orderCost).toFixed(0)), noPricing: false} : 
                                        {OrderCost: this.state.scannedOrder.OrderCost, noPricing: true});
  },
  componentDidMount() {
    if (document.getElementById('packageLength')) {
      document.getElementById('packageLength').focus()
      document.getElementById('packageLength').select()
    }
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.scannedPricing === 0 || nextProps.scannedPricing.length === 0) {
      this.setState({noPricing: true});
    } else {
      this.setState({
        noPricing: false
      });
    }

    if (!nextProps.isDuplicate && this.state.isDuplicate) {
      this.setState({
        scannedOrder: nextProps.scannedOrder,
        PackageWidth: nextProps.scannedOrder.PackageWidth || '0',
        PackageHeight: nextProps.scannedOrder.PackageHeight || '0',
        PackageLength: nextProps.scannedOrder.PackageLength || '0',
        PackageWeight: nextProps.scannedOrder.PackageWeight || '0',
        TotalValue: nextProps.scannedOrder.TotalValue || '0',
        OrderCost: nextProps.scannedOrder.OrderCost || '0',
        IsCOD: nextProps.scannedOrder.IsCOD
      })
    }
    this.setState({
      isSuccessEditing: nextProps.isSuccessEditing,
      isDuplicate: nextProps.isDuplicate
    });
  },
  componentWillUnmount() {
    document.getElementById('findOrder') && document.getElementById('findOrder').focus();
  },
  closeModal() {
    let changed = false;
    let updatedFields = ['PackageLength', 'PackageHeight', 'PackageWidth', 'PackageWeight', 'TotalValue', 'IsCOD', 'OrderCost'];
    updatedFields.forEach((field) => {
      let data = parseFloat(this.state[field])
      if (isNaN(data)) {
        data = this.state[field]
      }
      if (this.props.scannedOrder[field] != data) {
        changed = true
      }
    })

    const thisClass = this;
    function close () {
      thisClass.setState({showModal: false, scannedOrder: {}});
      thisClass.props.StopEditOrder();
    }

    if (changed) {
      this.props.askClose({
        message: 'Are you sure to close? Your changes will be lost.',
        action: function () {
          close()
        },
        backElementFocusID: 'addOrder'
      })
    } else {
      close()
    }
  },
  updateOrder() {
    let updatedFields = ['PackageLength', 'PackageHeight', 'PackageWidth', 'PackageWeight', 'TotalValue', 'IsCOD', 'OrderCost'];
    let currentData = lodash.assign({}, this.state);
    let updatedData = {}
    updatedFields.forEach(function(field) {
      if (typeof currentData[field] !== 'undefined') {
        updatedData[field] = parseFloat(currentData[field]);
        if (isNaN(updatedData[field])) {
          updatedData[field] = currentData[field]
        }
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
      editDelivery: true,
      orderCostAutoUpdateDone: true
    });
    if (!this.state.orderCostAutoUpdateDone) {
      this.calculatePricing(null, null, this.props.scannedPricing, this.props.isPricingByWeight);
    }
    let timeout = setTimeout(() => {
      document.getElementById('deliveryFee').focus();
      document.getElementById('deliveryFee').select();
      clearTimeout(timeout);
    }, 100);
  },
  saveDelivery() {
    this.setState({editDelivery: false});
  },
  showNoPricingInfo() {
    this.setState({showNoPricingInfo: true});
  },
  hideNoPricingInfo() {
    this.setState({showNoPricingInfo: false});
  },
  chooseOrder(val) {
    this.props.findOrder(val);
  },
  render() {
    const {isDuplicate, duplicateOrders} = this.props;
    const scannedOrder = this.state.scannedOrder;
    const defaultCODValues = config.defaultCODValues;

    let duplicateOrdersContent = [];

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
        { !isDuplicate &&
          <div className={styles.modal}>
            <button className={styles.closeModalButton} onClick={this.closeModal}>
              <img src="/img/icon-close.png" className={styles.closeButtonImage}/>
            </button>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{scannedOrder.UserOrderNumber} ({scannedOrder.WebOrderID})</h2>
              <div className={styles.modalInfo}>
                <div className={styles.orderContentLeft}>
                  <div className={styles.smallText}>From</div>
                  {
                    scannedOrder.User &&
                    <h2 className={styles.bigText}>{scannedOrder.User.FirstName} {scannedOrder.User.LastName}</h2>
                  }
                </div>
                <div className={styles.orderContentRight}>
                  <div className={styles.smallText}>Destination Area</div>
                  {
                    scannedOrder.DropoffAddress &&
                    <h2 className={styles.bigText}>{scannedOrder.DropoffAddress.City}</h2>
                  }
                </div>
                <div className={styles.clearfix}></div>
              </div>
            </div>

            <div className={styles.modalContent1}>
              <InputRow id={'packageLength'} label={'Length (cm)'} value={this.state.PackageLength} 
                type={'text'} onChange={this.stateChangeAndCalculate('PackageLength')} onEnterKeyPressed={this.updateOrder} width={25}/>
              <InputRow id={'packageWidth'} label={'Width (cm)'} value={this.state.PackageWidth} 
                type={'text'} onChange={this.stateChangeAndCalculate('PackageWidth')} onEnterKeyPressed={this.updateOrder} width={25} />
              <InputRow id={'packageHeight'} label={'Height (cm)'} value={this.state.PackageHeight} 
                type={'text'} onChange={this.stateChangeAndCalculate('PackageHeight')} onEnterKeyPressed={this.updateOrder} width={25} />
              <InputRow id={'packageWeight'} label={'Weight (kg)'} value={this.state.PackageWeight} 
                type={'text'} onChange={this.stateChangeAndCalculate('PackageWeight')} onEnterKeyPressed={this.updateOrder} width={25} />
              <InputRow id={'totalValue'} label={'Package Value (rupiah)'} value={this.state.TotalValue} 
                type={'price'} onChange={this.stateChange('TotalValue', 'price')} onEnterKeyPressed={this.updateOrder} width={50} />
              <InputRow id={'isCOD'} label={'Is COD'} value={this.state.IsCOD} selectItems={defaultCODValues}
                type={'select'} onChange={this.stateChange('IsCOD')} width={50} customStyle={styles.customStyle}/>
            </div>

            <div className={styles.modalContent2}>
              <div className={styles.orderContentLeft}>
                <div className={styles.smallText}>Volume Weight</div>
                <h2 className={styles.bigText}>
                  {((this.state.PackageLength * this.state.PackageWidth * this.state.PackageHeight) / 
                      config.volumetricFactor).toFixed(1)} kg
                </h2>
              </div>
              <div className={styles.orderContentRight}>
                <div className={styles.smallestText}>
                  Automatically calculated based on the length, width, and height above</div>
              </div>
              <div className={styles.clearfix}></div>
              <div className={styles.orderContentLeft}>
                { !this.state.noPricing &&
                  <div className={styles.smallText}>Delivery Fee</div>
                }
                { this.state.noPricing &&
                  <div className={styles.smallText + ' ' + styles.redText}>
                    <span onMouseOver={this.showNoPricingInfo} onMouseLeave={this.hideNoPricingInfo}>
                      Delivery Fee &nbsp;
                      <FontAwesome name="exclamation-circle" /> &nbsp;
                    </span>
                    { this.state.showNoPricingInfo &&
                      <span className={styles.verySmallText + ' ' + styles.infoText}>
                        Please manually edit to change the delivery fee.
                      </span>
                    }
                  </div>
                }
                { !this.state.editDelivery && 
                  <div>
                    { scannedOrder.OrderCost !== this.state.OrderCost &&
                      <h2 className={styles.bigTextThinStrike}>Rp. {scannedOrder.OrderCost}</h2>                    
                    }
                    <h2 className={styles.bigText}>
                      <NumberFormat value={this.state.OrderCost} displayType={'text'} 
                        thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} />
                    </h2>
                  </div>
                }
                { this.state.editDelivery &&
                  <span>
                    <InputWithDefaultNumberFormatted format={{thousandSeparator: '.', decimalSeparator: ',', prefix: 'Rp '}}
                      id={'deliveryFee'} className={styles.input + ' ' + styles.inputWithBorder}
                      currentText={this.state.OrderCost} type={'price'} onChange={this.stateChange('OrderCost', 'price')}
                      handleEnter={this.saveDelivery} />
                  </span>
                }
              </div>
              <div className={styles.orderContentRight}>
                { !this.state.editDelivery &&
                  <button className={styles.normalButton} onClick={this.editDelivery}>EDIT</button>
                }
                { this.state.editDelivery &&
                  <button className={styles.normalButton} onClick={this.saveDelivery}>SAVE</button>
                }
              </div>
              <div className={styles.clearfix}></div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.saveButton} onClick={this.updateOrder}>Update</button>
            </div>
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
      showModal: false
    }
  },
  componentDidMount() {
    document.getElementById('findOrder') && document.getElementById('findOrder').focus();
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
  },
  openModal() {
    this.setState({
      showModal: true
    });
  },
  closeModal() {
    this.setState({showModal: false});    
    this.props.StopEditOrder();
  },
  render() {
    const {isEditing} = this.props;
    const inputVerifyStyles = {
      container: styles.verifyInputContainer,
      input: styles.verifyInput
    };
    return (
      <Page title="Update Orders" count={{itemName: 'Items', done: 'All Done', value: this.props.total}}>
        {
          this.state.showModal && isEditing &&
          <ModalContainer onClose={this.closeModal}>
            <UpdateModal {...this.props} order={this.props.scannedOrder}/>
          </ModalContainer>
        }
        <div className={styles.actionContainer}>
          <Input styles={inputVerifyStyles} onChange={this.changeFindOrder} onEnterKeyPressed={this.findOrder} ref="findOrder" 
            base={{value: this.state.findOrderQuery, placeholder: 'Write the web order ID or EDS/AWB here to update it manually....'}} 
            id="findOrder" />
          <div onClick={this.findOrder} className={styles.verifyButton}>Submit</div>
        </div>
        <UpdateOrdersTable />
      </Page>
    );
  }
});

function mapStateToProps (state) {
  const {updateOrders} = state.app;
  const userLogged = state.app.userLogged;
  const {total, isEditing, scannedOrder, isSuccessEditing, scannedPricing, isPricingByWeight, isDuplicate, duplicateOrders} = updateOrders;

  return {
    userLogged,
    total,
    isEditing,
    scannedOrder,
    isSuccessEditing,
    scannedPricing,
    isPricingByWeight,
    isDuplicate,
    duplicateOrders
  }
}

function mapDispatchToProps (dispatch) {
  return {
    UpdateOrder: function(id, order){
      dispatch(UpdateOrders.UpdateOrder(id, order, true));
    },
    StopEditOrder: function() {
      dispatch(UpdateOrders.StopEditOrder());
    },
    revertSuccessEditing: function() {
      dispatch(UpdateOrders.RevertSuccessEditing());
    },
    findOrder: function(query) {
      dispatch(UpdateOrders.StartEditOrder(query));
    },
    askClose: function (modal) {
      dispatch(ModalActions.addConfirmation(modal));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrdersPage);