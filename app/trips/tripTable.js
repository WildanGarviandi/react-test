import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as TripService from './tripService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {formatDate} from '../helper/time';
import {ButtonBase} from '../views/base';
import DriverSetter from './driverSetter';
import OrderTable from './orderTable';

function StoreBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myTrips;

        return {
            value: filters[keyword],
        }
    }    
}

function DispatchBuilder(keyword) {
    return (dispatch) => {
        function OnChange(e) {
            const newFilters = {[keyword]: e.target.value};
            dispatch(TripService.UpdateFilters(newFilters));
        }

        function OnKeyDown(e) {
            if(e.keyCode !== 13) {
                return;
            }

            dispatch(TripService.StoreSetter("currentPage", 1));
            dispatch(TripService.FetchList());
        }

        return {
            onChange: OnChange, 
            onKeyDown: OnKeyDown,
        }
    }
}

function DispatchDateTime(dispatch) {
    return {
        onChange: function(date) {
            dispatch(TripService.SetCreatedDate(date));
        }
    }
}

function DropdownStoreBuilder(name) {
    return (store) => {

        const options = {
            "statusName": OrderStatusSelector.GetList(store),
        }

        return {
            value: store.app.myTrips[name],
            options: options[name]
        }
    }
}

function DropdownDispatchBuilder(filterKeyword) {
    return (dispatch) => {
        return {
            handleSelect: (selectedOption) => {
                const SetFn = TripService.SetDropDownFilter(filterKeyword);
                dispatch(SetFn(selectedOption));
            }
        }
    }
}

function CheckboxDispatch(dispatch, props) {
    return {
        onChange: () => {
            dispatch(TripService.ToggleChecked(props.tripID));
        }
    }
}
 
function CheckboxHeaderStore(store) {
    return {
        value: store.app.myTrips.selectedAll,
    }
}
 
function CheckboxHeaderDispatch(dispatch) {
    return {
        onChange: () => {
            dispatch(TripService.ToggleCheckedAll());
        }
    }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myTrips;
        return {
            startDate: filters['start' + keyword],
            endDate: filters['end' + keyword],
        }
    }
}
 
function DateRangeDispatch(keyword) {
    return (dispatch) => {
        return {
            onChange: (event, picker) => {
                const newFilters = {
                    ['start' + keyword]: picker.startDate.toISOString(),
                    ['end' + keyword]: picker.endDate.toISOString()
                }
                dispatch(TripService.UpdateAndFetch(newFilters))
            }
        }
    }
}

function ConnectBuilder(keyword) {
    return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
    return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);
const ContainerNumberFilter = ConnectBuilder('containerNumber')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const MerchantFilter = ConnectBuilder('merchant')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const DriverFilter = ConnectBuilder('driver')(Table.InputCell);
const PickupDateFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Table.FilterDateTimeRangeCell);
const OrderFilter = ConnectBuilder('order')(Table.InputCell);

function TripHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader text="Trip Number" />
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="Webstore" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Pickup Time" />
            <Table.TextHeader text="Driver" />
            <Table.TextHeader text="Number of Orders" style={{whiteSpace:'nowrap'}} />
        </tr>
    );
}

function TripParser(trip) {
    function getFullName(user) {
        if (!user) {
            return "";
        }

        return `${user.FirstName} ${user.LastName}`;
    }

    function getMerchantName(route) {
        return route && route.UserOrder && route.UserOrder.User && getFullName(route.UserOrder.User);
    }

    function getDriverName(trip) {
        return trip.Driver && getFullName(trip.Driver);
    }

    const merchantNames = lodash
        .chain(trip.UserOrderRoutes)
        .map((route) => (getMerchantName(route)))
        .uniq()
        .value()
        .join(', ');

    return lodash.assign({}, trip, {
        TripDriver: getDriverName(trip),
        TripMerchant: merchantNames,
        IsChecked: ('IsChecked' in trip) ? trip.IsChecked : false,
    })
}

function TripFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <ContainerNumberFilter />
            <StatusFilter />
            <MerchantFilter />
            <PickupFilter />
            <DropoffFilter />
            <PickupDateFilter />
            <DriverFilter />
            <OrderFilter />
        </tr>
    )
}

const TripRow = React.createClass({
    getInitialState() {
        return ({isHover: false, isEdit: false});
    },
    editTrip(trip) {
        this.setState({isEdit: true});
    },
    cancelEdit() {
        this.setState({isEdit: false});
    },
    expandTrip(trip) {
        if (!this.props.expandedTrip.TripID) {
            this.props.expand(trip);
        } else {
            if (this.props.expandedTrip.TripID !== trip.TripID) {
                this.props.expand(trip);
            } else {
                this.props.shrink();
            }
        }
    },
    onMouseOver() {
        this.setState({isHover: true});
    },
    onMouseOut() {
        this.setState({isHover: false});
    },
    render() {
        const { trip, expandedTrip } = this.props;
        const { isEdit, isHover } = this.state;
        return (
           <tr className={styles.tr} onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut}>
                <CheckboxRow checked={trip.IsChecked} tripID={trip.TripID} />
                <Table.LinkCell to={'/mytrips/detail/' + trip.TripID} text={trip.ContainerNumber} />
                <Table.TextCell text={trip.OrderStatus && trip.OrderStatus.OrderStatus} />
                <Table.TextCell text={trip.TripMerchant } />
                <Table.TextCell text={trip.PickupAddress && trip.PickupAddress.Address1} />
                <Table.TextCell text={trip.DropoffAddress && trip.DropoffAddress.Address1} />
                <Table.TextCell text={trip.PickupTime && formatDate(trip.PickupTime)} />
                {
                    isEdit
                    ?
                        <Table.Cell><DriverSetter trip={trip} close={this.cancelEdit}/></Table.Cell>
                    :
                        <Table.HoverCell
                            text={trip.Driver && trip.TripDriver}
                            isHover={isHover && (trip.OrderStatus.OrderStatus === "BOOKED" || trip.OrderStatus.OrderStatus === "PREBOOKED")}
                        >
                            <ButtonBase href="#" onClick={()=>{this.editTrip(trip)}}>Edit Driver</ButtonBase>
                        </Table.HoverCell>
                    
                }
                <Table.HoverCell
                    text={trip.UserOrderRoutes.length}
                    isHover={isHover || trip.TripID == expandedTrip.TripID}
                    style={{textAlign: 'center'}}
                >
                    {
                        trip.UserOrderRoutes.length > 0 &&
                        <ButtonBase href="#" onClick={()=>{this.expandTrip(trip)}}>{trip.UserOrderRoutes.length} orders in this trip</ButtonBase>
                    }
                </Table.HoverCell>
            </tr>
        );
    }
});

const TripBody = React.createClass({
    getBodyContent() {
        const { trips, expandedTrip, expand, shrink } = this.props;
        let content = [];
        trips.forEach((trip) => {
            content.push(<TripRow key={trip.TripID} trip={TripParser(trip)} expandedTrip={expandedTrip} expand={expand} shrink={shrink} />);
            if (expandedTrip && trip.TripID === expandedTrip.TripID) {
                content.push(
                    <tr key={trip.TripID + 'expanded'} className={styles.tr}>
                        <Table.Cell colspan={9}>
                            <div>
                                <ButtonBase href="#">Move</ButtonBase>
                                <ButtonBase href="#">Create</ButtonBase>
                            </div>
                            <OrderTable orders={trip.UserOrderRoutes} />
                        </Table.Cell>
                    </tr>
                );
            }
        });
        return content;
    },
    render() {
        return (
            <tbody>
                {this.getBodyContent()}
            </tbody>
        );
    }
});

function TripBodyStore() {
    return (store) => {
        const { expandedTrip } = store.app.myTrips;
        return {
            expandedTrip: expandedTrip
        }
    }
}

function TripBodyDispatch() {
    return (dispatch) => {
        return {
            expand: (trip) => {
                dispatch(TripService.ExpandTrip(trip));
            },
            shrink: () => {
                dispatch(TripService.ShrinkTrip());
            }
        }
    }
}

const TripBodyContainer = connect(TripBodyStore, TripBodyDispatch)(TripBody);

function TripTable({trips}) {
  const headers = <TripHeader />;

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody><TripFilter /></tbody>
      <TripBodyContainer trips={trips} />
    </table>
  );
}

export default TripTable;