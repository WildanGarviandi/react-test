import lodash from 'lodash';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import * as OutboundTrips from './outboundTripsService';
import {Input, EmptySpace, ButtonBase} from '../views/base';
import styles from './styles.css';
import {ModalDialog} from 'react-modal-dialog';

import DateTime from 'react-datetime';
import {RadioGroup, Radio} from '../components/form';
import {formatDate, formatDateHourOnly} from '../helper/time';
import ImagePreview from '../views/base/imagePreview';
import ImageUploader from '../views/base/imageUploader';
import {Weight, DstHub, DstDistrict, HubSetter} from './outboundTripsHelper';
import config from '../config/configValues.json';
import * as UtilHelper from '../helper/utility';
import {Pagination3} from '../components/pagination3';

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
            <ImageUploader currentImageUrl={value} updateImageUrl={(data) => this.props.onChange(data)} withoutPreview={true} />
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
    return {selected: this.props.selected, driverFleetList: this.props.items, searchValue: ''}
  },
  select(key) {
    this.props.driverInModalSelected(key)
    this.setState({selected: key})
  },
  searchDriver(e) {
    if (e.key === 'Enter') {
      const newFilters = {['name']: e.target.value};
      this.props.updateAndFetchDrivers(newFilters);
      this.props.fetchDrivers();
    }
  },
  componentWillReceiveProps(nextProps) {
    this.setState({driverFleetList: nextProps.items});
  },
  enterDriverSearch(e) {
    const newFilters = {['name']: e.target.value};
    this.props.updateFiltersDrivers(newFilters);
  },
  enterDriverFleetSearch(e) {
    this.setState({searchValue: e.target.value});
    let driverFleetList = lodash.filter(this.props.items, function(driver) { 
      let driverName = driver.FirstName + ' ' + driver.LastName;
      let searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({driverFleetList: driverFleetList});
  },
  render() {
    const {trip} = this.props

    let weight
    if (trip) {
      weight = Weight(trip)
    }
    const selected = (this.props.selected) ? this.props.selected : this.state.selected;

    const Drivers = lodash.map(this.props.items, (item, key) => {
      let currentLoad, isOverload
      if (trip) {
        currentLoad = (selected === key) ? parseFloat(item.CurrentWeight) + parseFloat(weight) : parseFloat(item.CurrentWeight)
        isOverload = currentLoad > item.TotalCapability
      }
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
            <span className={styles.mediumText}><strong>{UtilHelper.trimString(item.FirstName + ' ' + item.LastName, 25)}</strong></span>
            <br/>
          </div>
          { trip &&
            <div className={styles.driverDistance}>
              <span className={styles.infoList}>From your location</span>
              <div className={styles.infoLocation}>
                <img src="/img/icon-location.png" width="24"/>
                { item.DistanceToNearestPickup && 
                  <span className={styles.baseline}>
                    <span className={styles.bigText}>{(item.DistanceToNearestPickup).toFixed(2) || 'N/A'}</span>
                    <span>km</span>
                  </span>
                }
                { !item.DistanceToNearestPickup &&
                  <span className={styles.bigText}>N/A</span>
                }
              </div>
            </div>
          }
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
  getInitialState () {
    return {
      isLastMileAssigning: true,
      isLastMile: false,
      isNotLastMile: false,
      isFleetSet: false,
      selectedFleet: null,
      isDriverSet: false,
      selectedDriver: null,
      selectedFleetDriver: null,
      Fee: 0,
      isExternalDataValid: false,
      isHubAssigning: false,
      AwbNumber: ' ',
      driverFleetList: this.props.nearbyFleets.drivers, 
      searchValue: ''
    }
  },
  isLastMile () {
    this.props.SetHub(this.props.trip.TripID);
    this.setState({
      isLastMile: true,
      isLastMileAssigning: false
    })
  },
  isNotLastMile () {
    this.setState({
      isLastMile: false,
      isLastMileAssigning: false,
      isHubAssigning: true
    })
  },
  fleetInModalSelected (key) {
    this.state.fleet = this.props.nearbyFleets.fleets[key]
    this.setState({
      selectedFleet: key,
      isFleetSet: true,
      selectedFleetDriver: null
    })
    this.props.fetchFleetDriver(this.state.fleet.FleetManagerID)
  },
  fleetDriverInModalSelected (key) {
    this.state.fleetDriver = this.props.nearbyFleets.drivers[key]
    this.setState({
      selectedFleetDriver: key,
      isFleetDriverSet: true
    })
  },
  driverInModalSelected (key) {
    this.state.driver = this.props.nearbyDrivers.drivers[key]
    this.setState({
      selectedDriver: key,
      isDriverSet: true
    })
  },
  cancelSelectFleet () {
    this.state.fleet = {}
    this.setState({
      selectedFleet: '',
      isFleetSet: false 
    })
  },
  driverSet () {
    this.props.driverSet(this.props.trip.TripID, this.state.driver.UserID)
  },
  fleetSet () {
    this.props.fleetSet(this.props.trip.TripID, this.state.fleet.FleetManagerID, this.state.fleetDriver.UserID)
  },
  fleetSetWithoutDriver () {
    this.props.fleetSet(this.props.trip.TripID, this.state.fleet.FleetManagerID)
  },
  thirdPartyLogisticSave () {
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
  onChange (key) {
    return (val) => {
      this.setState({[key]: val})
    }
  },
  closeModal () {
    this.props.closeAssigning()
  },
  componentDidUpdate () {
    const {Fee, Transportation, ArrivalTime, DepartureTime, Sender, PictureUrl, AwbNumber, isExternalDataValid} = this.state
    if ((Fee < 0) || !Transportation || !ArrivalTime || !DepartureTime || !Sender) {
      if (isExternalDataValid) {
        this.setState({isExternalDataValid: false})
      }
    } else {
      if (!isExternalDataValid) {
        this.setState({isExternalDataValid: true})
      }
    }
  },
  onHubSet () {
    this.setState({isHubAssigning: false})
  },
  componentWillReceiveProps(nextProps) {
    this.setState({driverFleetList: nextProps.nearbyFleets.drivers});
  },
  searchDriver(e) {
    if (e.key === 'Enter') {
      const newFilters = {['name']: e.target.value};
      this.props.UpdateAndFetchDrivers(newFilters);
    }
  },
  enterDriverSearch(e) {
    const newFilters = {['name']: e.target.value};
    this.props.UpdateFiltersDrivers(newFilters);
  },
  enterDriverFleetSearch(e) {
    this.setState({searchValue: e.target.value});
    let driverFleetList = lodash.filter(this.props.nearbyFleets.drivers, function(driver) { 
      let driverName = driver.FirstName + ' ' + driver.LastName;
      let searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({driverFleetList: driverFleetList});
  },
  render () {
    const trip = this.props.trip

    const fleetsProps = {
      trip: trip,
      items: this.props.nearbyFleets.fleets,
      isFetching: this.props.nearbyFleets.isFetching,
      selected: this.state.selectedFleet,
      fleetInModalSelected: this.fleetInModalSelected
    }

    const fleetDriverProps = {
      items: this.state.driverFleetList,
      isFetching: this.props.nearbyFleets.isDriverFetching,
      selected: this.state.selectedDriver,
      driverInModalSelected: this.fleetDriverInModalSelected
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
                        <Interval startTime={deadlineDiff} down={true} />
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
                  <div className={styles.isLastMile}>
                    <p>Is this a last mile trip?</p>
                    <div className={styles.buttonContainer}>
                      <div className={styles.modalNo} onClick={this.isNotLastMile}>
                        <img src="/img/icon-no.png" className={styles.isLastMileImage} />
                        <div>NO</div>
                      </div>
                      <div className={styles.modalYes} onClick={this.isLastMile}>
                        <img src="/img/icon-ok.png" className={styles.isLastMileImage} />
                        <div>YES</div>
                      </div>
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
                  <HubSetter trip={trip} nextDestination={DstHub(trip) || DstDistrict(trip)} onSelect={this.onHubSet}/>
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
                      <div className={styles.panelDriverSearch}>
                        <input className={styles.inputDriverSearch} onChange={this.enterDriverSearch} onKeyPress={this.searchDriver} placeholder={'Search Driver...'} />
                      </div>
                      <div className={styles.modalTabPanel}>
                        <DriverInModal {...driversProps} />
                      </div>
                      <Pagination3 {...this.props.paginationStateDrivers} {...this.props.PaginationActionDrivers} />
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
                      { this.state.isFleetSet &&
                        <div>
                          <EmptySpace height={10} />
                          <div className={styles.mediumText + ' ' + styles.centerItems}>Choose the driver</div>
                          <EmptySpace height={10} />
                          <div className={styles.panelDriverSearch}>
                            <input className={styles.inputDriverSearch} onChange={this.enterDriverFleetSearch} placeholder={'Search Driver...'} />
                          </div>
                        </div>
                      }
                      <div className={styles.modalTabPanel}>
                        { this.state.isFleetSet &&
                          <DriverInModal {...fleetDriverProps} />
                        }
                        { !this.state.isFleetSet &&
                          <FleetInModal {...fleetsProps} />
                        }
                      </div>
                      <div className={styles.modalFooter + ' ' + styles.textCenter}>
                        { !this.state.isFleetSet &&
                          <p><small>Please choose a vendor that you want to do this trip.</small></p>
                        }
                        { this.state.isFleetSet && !this.state.isLastMile &&
                          <p><small>You have selected a vendor for this trip!
                          <br/>
                          Please click on this button to continue</small></p>
                        }
                        
                        { !this.state.isLastMile &&
                          <button className="btn btn-md btn-success" onClick={this.fleetSet} 
                            disabled={!this.state.isFleetSet || 
                              (this.props.nearbyFleets && this.props.nearbyFleets.drivers && this.props.nearbyFleets.drivers.length === 0) || 
                              !this.state.isFleetDriverSet}>
                            Choose Driver</button>
                        }
                        { this.state.isLastMile && this.state.isFleetSet &&
                          <div>
                            <button className={"btn btn-md btn-success" + ' ' + styles.fleetDriverButton} onClick={this.fleetSetWithoutDriver}>
                              Choose without driver </button>
                            <button className={"btn btn-md btn-success" + ' ' + styles.fleetDriverButton} onClick={this.fleetSet} 
                              disabled={this.state.selectedFleetDriver === null}>Choose Driver</button>
                          </div>
                        }
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
  const {trip, nearbyFleets, nearbyDrivers, isSuccessAssigning, isHubAssigning, currentPageDrivers, limitDrivers, totalDrivers} = outboundTripsService

  return {
    trip,
    nearbyFleets,
    nearbyDrivers,
    isSuccessAssigning,
    isHubAssigning,
    paginationStateDrivers: {
      currentPage: currentPageDrivers, 
      limit: limitDrivers, 
      total: totalDrivers
    }
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
      dispatch(OutboundTrips.AssignDriver(tripID, driverID))
    },
    fleetSet(tripID, fleetManagerID, driverID) {
      dispatch(OutboundTrips.AssignFleet(tripID, fleetManagerID, driverID))
    },
    fetchFleetDriver(fleetManagerID) {
      dispatch(OutboundTrips.FetchListFleetDrivers(fleetManagerID))
    },
    SetHub: (tripID) => {
      dispatch(OutboundTrips.setHub(tripID, null))
    },
    PaginationActionDrivers: {
      setCurrentPage: (currentPage) => {
          dispatch(OutboundTrips.SetCurrentPageDrivers(currentPage));
      },
      setLimit: (limit) => {
          dispatch(OutboundTrips.SetLimitDrivers(limit));
      },
    },
    FetchDrivers() {
      dispatch(OutboundTrips.FetchListNearbyDrivers());
    },
    UpdateFiltersDrivers(filters) {
      dispatch(OutboundTrips.UpdateFiltersDrivers(filters));
    },
    UpdateAndFetchDrivers(filters) {
      dispatch(OutboundTrips.UpdateAndFetchDrivers(filters));
    }
  }
}

export default connect(ModalStateToProps, ModalDispatchToProps)(AssignTripModalClass)