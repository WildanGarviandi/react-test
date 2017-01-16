import lodash from 'lodash'
import moment from 'moment'
import React from 'react'
import {connect} from 'react-redux'
import * as OutboundTrips from './outboundTripsService'
import {Input, EmptySpace} from '../views/base'
import styles from './styles.css'
import {ModalDialog} from 'react-modal-dialog'

import DateTime from 'react-datetime'
import {RadioGroup, Radio} from '../components/form'
import {formatDate, formatDateHourOnly} from '../helper/time'
import ImagePreview from '../views/base/imagePreview'
import ImageUploader from '../views/base/imageUploader'
import {Weight, DstHub, DstDistrict, HubSetter} from './outboundTripsHelper'
import config from '../config/configValues.json'

const DetailRow = React.createClass({
  generateTypeContent () {
    const {type, value, placeholder} = this.props

    switch (type) {
      case 'datetime' :
        return (
          <span className={styles.inputForm}>
            <span className={styles.datetimeWrapper}>
              <DateTime onChange={this.props.onChange} className={styles.inputForm}
                dateFormat='DD MMM YYYY' timeFormat='HH:mm:ss' viewMode='days' />
            </span>
          </span>
        )
      case 'image' :
        return (
          <div className={styles.imageUploaderWrapper}>
            <ImageUploader currentImageUrl={value} updateImageUrl={(data) => this.props.onChange(data)} />
          </div>
        )
      default :
        return (
          <div className={styles.inputForm}>
            <Input className={'form-control'} base={{placeholder: placeholder, value: value}}
              onChange={(data) => this.props.onChange(data)} type={type}/>
          </div>
        )
    }
  },
  render () {
    const {isEditing, label, type, value, className, placeholder} = this.props

    return (
      <div className={className}>
        <div className={styles.inputLabel}>{label}</div>
        {
          !isEditing &&
          <span className={styles.inputForm}>
          {
            type === 'image'
            ? <ImagePreview imageUrl={value} />
            : value
          }
          </span>
        }
        {
          isEditing &&
          this.generateTypeContent()
        }
      </div>
    )
  }
})

const Tabs = React.createClass({
  displayName: 'Tabs',
  propTypes: {
    selected: React.PropTypes.number,
    children: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.element
    ]).isRequired
  },
  getDefaultProps() {
    return {
      selected: 0
    }
  },
  getInitialState() {
    return {
      selected: this.props.selected
    }
  },
  handleClick(index, event) {
    event.preventDefault()
    this.setState({
      selected: index
    })
  },
  _renderTitles() {
    function labels(child, index) {
      return (
        <li key={index} className={(this.state.selected === index ? styles.active : '')} 
            onClick={this.handleClick.bind(this, index)}>
          <a href='#'>{child.props.label}</a>
        </li>
      )
    }
    return (
      <ul className={styles.tabs__labels}>
        {this.props.children.map(labels.bind(this))}
      </ul>
    )
  },
  _renderContent() {
    return (
      <div className={styles.tabs__content}>
        {this.props.children[this.state.selected]}
      </div>
    )
  },
  render() {
    return (
      <div className='tabs'>
        {this._renderTitles()}
        {this._renderContent()}
      </div>
    )
  }
})

const Pane = React.createClass({
  displayName: 'Pane',
  propTypes: {
    label: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  },
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
})


const FleetInModal = React.createClass({
  getInitialState() {
    return {selected: this.props.selected}
  },
  select(key) {
    this.props.fleetInModalSelected(key)
    this.setState({selected: key})
  },
  render() {
    const {trip} = this.props

    var qty = trip.UserOrderRoutes.length
    var selected = (this.props.selected) ? this.props.selected : this.state.selected

    const Fleets = lodash.map(this.props.items, (item, key) => {
      const currentLoad = (selected === key) ? item.CurrentLoad + qty : item.CurrentLoad

      return (
        <div key={key} className={styles.listInModal + ' ' + (selected === key ? styles.active : '')}>
          <Radio value={key} />
          <div className={styles.checkedFleet} onClick={this.select.bind(null, key)}></div>
          { item.FleetManager &&
            <img src={item.FleetManager.PictureUrl} />
          }
          <div className={styles.vendorName}>
            <div className={styles.mediumText}>
              <strong>
                { item.FleetManager && item.FleetManager.CompanyDetail &&
                  item.FleetManager.CompanyDetail.CompanyName}
                { (!item.FleetManager || !item.FleetManager.CompanyDetail) && 'No Name'}
              </strong>
            </div>
          </div>
          <div className={styles.ovl}>
            <img src='/img/icon-grouping.png' />
            <span className={styles.bigText}>
              { item.FleetManager && item.FleetManager.CompanyDetail &&
                currentLoad + '/' + item.FleetManager.CompanyDetail.OrderVolumeLimit}
              { (!item.FleetManager || !item.FleetManager.CompanyDetail) &&
                currentLoad + '/-'
              }
            </span>
          </div>
        </div>
      )
    })

    if (this.props.isFetching) {
      return (
        <div className={styles.searchLoadingArea + ' text-center'}>
          <img src='/img/icon-search-color.png' />
          <h3>Searching......</h3>
          <p>We will search for the best vendor suitable for the job, based on their location to the drop off area and zip code</p>
        </div>
      )
    } else {
      if (this.props.items.length === 0) {
        return (
          <div className={styles.centerItems}>
            <div className={styles.mediumText}>
              No fleets found
            </div>
          </div>
        )
      } else {
        return (
          <div className={styles.fleet}>
            <RadioGroup name="fleet" selectedValue={this.state.selected} onChange={this.select}>
              {Fleets}
            </RadioGroup>
          </div>
        )
      }
    }
  }
})

const DriverInModal = React.createClass({
  getInitialState() {
    return {selected: this.props.selected}
  },
  select(key) {
    this.props.driverInModalSelected(key)
    this.setState({selected: key})
  },
  render() {
    const {trip} = this.props

    const weight = Weight(trip)
    const selected = (this.props.selected) ? this.props.selected : this.state.selected

    const Drivers = lodash.map(this.props.items, (item, key) => {
      const currentLoad = (selected === key) ? parseFloat(item.CurrentWeight) + parseFloat(weight) : parseFloat(item.CurrentWeight)
      const isOverload = currentLoad > item.TotalCapability
      const imgSrc = (item.Vehicle && item.Vehicle.VehicleID === 1) ? '/img/icon-vehicle-motor.png' : '/img/icon-vehicle-van.png'

      return (
        <div key={key} className={styles.listInModal + ' ' + styles.colMd12 + (selected === key ? ' ' + styles.active : '') +
                                  (isOverload ? ' ' + styles.activeRed : '')}>
          <div className={styles.colMd2 + ' ' + styles.noPadding}>
            <div className={styles.colMd6 + ' ' + styles.noPadding}>
              <Radio value={key} />
              <div className={styles.checkedFleet} onClick={this.select.bind(null, key)}></div>
            </div>
            <div className={styles.colMd6 + ' ' + styles.noPadding}>
              <img src={imgSrc} width="100%" />
            </div>
          </div>
          <div className={styles.colMd7 + ' ' + styles.vendorName}>
            <span className={styles.mediumText}><strong>{item.FirstName + ' ' + item.LastName}</strong></span>
            <br/>
            <span className={styles.infoWeight + (isOverload ? ' ' + styles.red : '')}>
              Available weight : {currentLoad + '/' + item.TotalCapability} kg
            </span>
          </div>
          <div className={styles.colMd3 + ' ' + styles.noPadding + ' ' + styles.driverDistance + ' pull-right'}>
            <span className={styles.infoList}>From your location</span>
            <div className={styles.ovl + ' ' + styles.infoLocation}>
              <img src="/img/icon-location.png" width="24"/>
              { item.DistanceToNearestPickup && 
                <span className={styles.baseline}>
                  <span className={styles.bigText}>{(item.DistanceToNearestPickup).toFixed(2)}</span>
                  <span>km</span>
                </span>
              }
              { !item.DistanceToNearestPickup &&
                <span className={styles.bigText}>N/A</span>
              }
            </div>
          </div>
        </div>
      )
    })

    if (this.props.isFetching) {
      return (
        <div className={styles.searchLoadingArea + ' text-center'}>
          <img src="/img/icon-search-color.png" />
          <h3>Searching......</h3>
          <p>We will search for the best driver suitable for the job, based on their location to the drop off area and zip code</p>
        </div>
      )
    } else {
      if (this.props.items.length === 0) {
        return (
          <div className={styles.centerItems}>
            <div className={styles.mediumText}>
              No drivers found
            </div>
          </div>
        )
      } else {
        return (
          <div className={styles.fleet}>
            <RadioGroup name="driver" selectedValue={this.state.selected} className="row" onChange={this.select}>
              {Drivers}
            </RadioGroup>
          </div>
        )
      }
    }
  }
})

const Interval = React.createClass({
  getInitialState() {
    return {
      time: this.props.startTime
    }
  },
  tickDown() {
    this.setState({
      time: this.state.time - 1000
    })
  },
  tickUp() {
    this.setState({
      time: this.state.time + 1000
    })
  },
  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.props.down) {
        this.tickDown()
      } else {
        this.tickUp()
      }
    }, 1000)
  },
  componentWillUnmount() {
    clearInterval(this.interval)
  },
  render() {
    let time = this.state.time
    if (time < 0) {
      time *= -1
    }
    return (
      <span>{formatDateHourOnly(time)}</span>
    )
  }
})

export { Interval }

const AssignTripModalClass = React.createClass({
  getInitialState() {
    return {
      isLastMileAssigning: true, 
      isLastMile: false,
      isNotLastMile: false,
      isFleetSet: false,
      selectedFleet: '',
      isDriverSet: false,
      selectedDriver: '',
      Fee: 0,
      isExternalDataValid: false,
      isHubAssigning: false,
      AwbNumber: ' '
    }
  },
  isLastMile() {
    this.setState({
      isLastMile: true,
      isLastMileAssigning: false
    })
  },
  isNotLastMile() {
    this.setState({
      isLastMile: false,
      isLastMileAssigning: false,
      isHubAssigning: true
    })
  },
  fleetInModalSelected(key) {
    this.state.fleet = this.props.nearbyfleets.fleets[key]
    this.setState({
      selectedFleet: key,
      isFleetSet: true
    })
  },
  driverInModalSelected(key) {
    this.state.driver = this.props.nearbyDrivers.drivers[key]
    this.setState({
      selectedDriver: key,
      isDriverSet: true
    })
  },
  driverSet () {
    this.props.driverSet(this.props.trip.TripID, this.state.driver.UserID)
  },
  fleetSet () {
    this.props.fleetSet(this.props.trip.TripID, this.state.fleet.FleetManagerID)
  },
  thirdPartyLogisticSave() {
    if (this.state.isExternalDataValid) {
      this.props.thirdPartyLogisticSave({
        TripID: this.props.trip.TripID,
        Fee: this.state.Fee,
        Transportation: this.state.Transportation,
        ArrivalTime: this.state.ArrivalTime,
        DepartureTime: this.state.DepartureTime,
        Sender: this.state.Sender,
        PictureUrl: this.state.PictureUrl,
        AwbNumber: this.state.AwbNumber
      })
    }
  },
  onChange(key) {
    return (val) => {
      this.setState({[key]: val})
    }
  },
  closeModal() {
    this.props.closeAssigning()
  },
  componentDidUpdate() {
    const {Fee, Transportation, ArrivalTime, DepartureTime, Sender, PictureUrl, AwbNumber, isExternalDataValid} = this.state
    if ((Fee < 0) || !Transportation || !ArrivalTime || !DepartureTime || !PictureUrl || !Sender || !AwbNumber) {
      if (isExternalDataValid) {
        this.setState({isExternalDataValid: false})
      }
    } else {
      if (!isExternalDataValid) {
        this.setState({isExternalDataValid: true})
      }
    }
  },
  componentWillReceiveProps(nextProps) {
    this.setState({isHubAssigning: nextProps.isHubAssigning})
  },
  render() {
    const trip = this.props.trip

    const fleetsProps = {
      trip: trip,
      items: this.props.nearbyfleets.fleets,
      isFetching: this.props.nearbyfleets.isFetching,
      selected: this.state.selectedFleet,
      fleetInModalSelected: this.fleetInModalSelected
    }

    const driversProps = {
      trip: trip,
      items: this.props.nearbyDrivers.drivers,
      isFetching: this.props.nearbyDrivers.isFetching,
      selected: this.state.selectedDriver,
      driverInModalSelected: this.driverInModalSelected
    }
    
    let tripType
    if (trip.District) {
      tripType = "Last Mile"
    } else if (trip.DestinationHub) {
      tripType = "Hub"
    } else {
      tripType = "No Destination Yet"
    }

    const nextDestination = (tripType === "Last Mile") ? trip.District && `${trip.District.City}` : trip.DestinationHub && `Hub ${trip.DestinationHub.Name}`
    let nextSuggestion = []
    for (var p in trip.NextDestinationSuggestion) {
      if (trip.NextDestinationSuggestion.hasOwnProperty(p) && p !== 'NO_SUGGESTION') {
        nextSuggestion.push(p + ' (' + trip.NextDestinationSuggestion[p] + 
          (trip.NextDestinationSuggestion[p] > 1 ? ' orders' : ' order') + ')')
      }
    }
    const suggestionComponents = nextSuggestion.map(function(suggestion, idx) {
      return (
        <li key={ idx }>{suggestion}</li>
      )
    })

    const deadline = moment(new Date(trip.CreatedDate)).add(config.outboundDeadlineFromCreated, 'hours')
    const deadlineDiff = deadline.diff(moment())

    return (
      <ModalDialog className={styles.modalDialog}>
        <button className={styles.closeModalButton} onClick={this.closeModal}>
          <img src="/img/icon-close.png" className={styles.closeButtonImage}/>
        </button>
        { !this.props.isSuccessAssigning &&
          <div>
            <div className={styles.modalHeader}>
              <h1>Assign Trip</h1>
            </div>
            <div className={styles.modalInfo + " nb"}>
              <div>
                <div className="row">
                  <div className={styles.modalInfoTripID}>
                    <div className={styles.smallText}>Trip ID</div>
                    <div className={styles.bigText}>{trip.TripID}</div>
                  </div>
                  <div className={styles.modalInfoWeight}>
                    <div className={styles.smallText}>Total Weight</div>
                    <div className={styles.bigText}>{Weight(trip)} Kg</div>
                  </div>
                  <div className={styles.modalInfoQuantity}>
                    <div className={styles.smallText}>Quantity</div>
                    <div className={styles.bigText}>{trip.UserOrderRoutes.length}</div>
                  </div>
                  <div className={styles.modalInfoDeadline}>
                    <div className={styles.smallText}>Deadline</div>
                    <div className={styles.bigText + ' ' + styles.red}>
                      { deadlineDiff > 0 &&
                        <Interval startTime={deadlineDiff} />
                      }
                      { deadlineDiff < 0 &&
                        <span>{deadline.fromNow()}</span>
                      }
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className={styles.modalInfoDestination}>
                    <div className={styles.smallText}>Destination Hub</div>
                    <div className={styles.bigText}>{nextDestination || '-'}</div>
                  </div>
                  { !this.state.isLastMileAssigning && !this.state.isLastMile &&
                    <div className={styles.modalInfoNotLastMile}>
                      <div className={styles.smallText}>Since its not a last mile, we suggest that you send this trip to</div>
                      <EmptySpace height={5} />
                      <div className={styles.smallText}><strong><ul>{suggestionComponents}</ul></strong></div>
                    </div>
                  }
                </div>
              </div>
            </div>

            { this.state.isLastMileAssigning &&
              <div>
                <div className={styles.modalBody}>
                  <div className={styles.isLastMile + " nb"}>
                    <p>Is this a last mile trip?</p>
                    <div className={styles.buttonContainer}>
                      <button className={styles.modalNo + " btn btn-md btn-danger"} onClick={this.isNotLastMile}>
                        <img src="/img/icon-no.png" className={styles.isLastMileImage} /> NO
                      </button>
                      <button className={styles.modalYes + " btn btn-md btn-success"} onClick={this.isLastMile}>
                        <img src="/img/icon-ok.png" className={styles.isLastMileImage} /> YES
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <p><small>Please choose if this trip is a last mile trip or not.</small></p>
                </div>
              </div>
            }

            { this.state.isHubAssigning &&
              <div>
                <div className={styles.modalBody}>
                  <HubSetter trip={trip} nextDestination={DstHub(trip) || DstDistrict(trip)} />
                </div>
                <div className={styles.modalFooter}>
                  <p><small>Please set the destination hub for this trip.</small></p>
                </div>
              </div>
            }

            { !this.state.isLastMileAssigning && !this.state.isHubAssigning &&
              <div className="nb">
                <Tabs selected={0}>
                  <Pane label="Assign To My Driver">
                    <div>
                      <div className={styles.modalTabPanel}>
                        <DriverInModal {...driversProps} />
                      </div>
                      <div className={styles.modalFooter}>
                        { !this.state.isDriverSet &&
                          <p>
                            <small>Please choose the driver that you want to do this trip.
                            <br/>
                            Its better to choose a driver who has minimum weight.</small>
                          </p>
                        }
                        { this.state.isDriverSet &&
                          <p>
                            <small>You have selected a driver for this trip!
                            <br/>
                            Please click on this button to continue</small>
                          </p>
                        }

                        <button className="btn btn-md btn-success" onClick={this.driverSet} disabled={!this.state.isDriverSet}>Assign To Driver</button>
                      </div>
                    </div>
                  </Pane>
                  <Pane label="Assign To Vendor">
                    <div>
                      <div className={styles.modalTabPanel}>
                        <FleetInModal {...fleetsProps} />
                      </div>
                      <div className={styles.modalFooter}>
                        { !this.state.isFleetSet &&
                          <p><small>Please choose a vendor that you want to do this trip.</small></p>
                        }
                        { this.state.isFleetSet &&
                          <p><small>You have selected a vendor for this trip!
                          <br/>
                          Please click on this button to continue</small></p>
                        }
                        
                        <button className="btn btn-md btn-success" onClick={this.fleetSet} disabled={!this.state.isFleetSet}>Assign To Vendor</button>
                      </div>
                    </div>
                  </Pane>
                  <Pane label="Long Haul">
                    <div>
                      <div className={styles.modalTabPanel}>
                        <div className="row">
                          <DetailRow label="3PL NAME" className={styles.colMd12 + ' ' + styles.detailRow} 
                            placeholder="Write the 3PL name here..." value={this.state.Sender} 
                            isEditing={true} type="text" onChange={this.onChange('Sender')} />
                          <DetailRow label="TRANSPORTATION" className={styles.colMd12 + ' ' + styles.detailRow} 
                            placeholder="Write the transportation here..." value={this.state.Transportation} 
                            isEditing={true} type="text" onChange={this.onChange('Transportation')} />
                          <DetailRow label="DEPARTURE TIME" className={styles.colMd6 + ' ' + styles.detailRow} 
                            value={this.state.DepartureTime} isEditing={true} type="datetime" onChange={this.onChange('DepartureTime')} />
                          <DetailRow label="ETA" className={styles.colMd6 + ' ' + styles.detailRow} 
                            value={this.state.ArrivalTime} isEditing={true} type="datetime" onChange={this.onChange('ArrivalTime')} />
                          <DetailRow label="FEE" className={styles.colMd6 + ' ' + styles.detailRow} 
                            value={this.state.Fee} isEditing={true} type="number" onChange={this.onChange('Fee')} />
                          <DetailRow label="AWB NUMBER" className={styles.colMd6 + ' ' + styles.detailRow} 
                            value={this.state.AwbNumber} isEditing={true} type="text" 
                            onChange={this.onChange('AwbNumber')} />
                          <div className={styles.colMd3}></div>
                          <div className={styles.colMd9 + ' ' + styles.centerItems}>
                            <div className={styles.uploadButtonText + ' ' + styles.colMd6 + ' ' + styles.noPadding}>
                              { !this.state.PictureUrl &&
                                <p>Upload your receipt here</p>
                              }
                              { this.state.PictureUrl &&
                                <a href={this.state.PictureUrl} target="_blank">Uploaded</a>
                              }
                            </div>
                            <DetailRow className={styles.colMd6 + ' ' + styles.detailRow + ' ' + styles.uploadButton} 
                              value={this.state.PictureUrl} isEditing={true} type="image" onChange={this.onChange('PictureUrl')}/>
                          </div>
                        </div>
                      </div>
                      <div className={styles.modalFooter}>
                        <p><small>You need to fill information above before you can continue.</small></p>
                        <button className="btn btn-md btn-success" onClick={this.thirdPartyLogisticSave}
                          disabled={!this.state.isExternalDataValid}>Assign To 3PL</button>
                      </div>
                    </div>
                  </Pane>
                </Tabs>
              </div>
            }
          </div>
        }
        { this.props.isSuccessAssigning &&
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Success</h2>
              <div className={styles.successContent + ' ' + styles.ordersContentEmpty}>
                <img className={styles.successIcon} src={"/img/icon-success.png"} />
                <div className={styles.mediumText}>You have successfully assigned this trip</div>
                <div className={styles.smallText}>
                  Please go to the inbound trip page to see its progress.
                </div>
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
})

function ModalStateToProps (state) {
  const {outboundTripsService} = state.app
  const {trip, nearbyfleets, nearbyDrivers, isSuccessAssigning, isHubAssigning} = outboundTripsService

  return {
    trip,
    nearbyfleets,
    nearbyDrivers,
    isSuccessAssigning,
    isHubAssigning
  }
}

function ModalDispatchToProps (dispatch, ownProps) {
  return {
    closeAssigning() {
      dispatch(OutboundTrips.EndAssigning())
    },
    thirdPartyLogisticSave(externalData) {
      dispatch(OutboundTrips.CreateExternalTrip(externalData))
    },
    fetchTripDetail(tripID) {
      dispatch(OutboundTrips.FetchDetails(tripID))
    },
    driverSet(tripID, driverID) {
      dispatch(OutboundTrips.AssignDriver(tripID, driverID));
    },
    fleetSet(tripID, fleetManagerID) {
      dispatch(OutboundTrips.AssignFleet(tripID, fleetManagerID));
    }
  }
}

export default connect(ModalStateToProps, ModalDispatchToProps)(AssignTripModalClass)