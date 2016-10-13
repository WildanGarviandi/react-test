import React from 'react';
import {connect} from 'react-redux';
import etobeeIcon from '../../img/app-icon.png';
import moment from 'moment';
import tripManifestStyle from './tripManifest.css';
import * as TripDetailsTrue from '../../modules/inboundTripDetails';
var QRCode = require('qrcode.react');

const TripManifestPage = React.createClass({
  componentWillMount() {
    this.props.detailsFetch(this.props.params.tripID);
  },
  componentWillReceiveProps(nextProps) {
    if(this.props.params.tripID !== nextProps.params.tripID) {
      this.props.detailsFetch(nextProps.params.tripID);
    }
  },
  componentDidUpdate(prevProps) {
    if (this.props.trip !== prevProps.trip) {
      // when page is rendered with trip & order details, print
      window.print();
    }
  },
  render() {

    const { isFetching, orders, trip } = this.props;

    return (
      <div>
        {
          // fetching data
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
        {
          // trip & orders data is ready to be rendered
          !isFetching && trip !== null &&
          <div className={tripManifestStyle.container}>
            <div className={tripManifestStyle.logo}>
              <img src={etobeeIcon} />
              <p>etobee</p>
            </div>
            <div className={tripManifestStyle.currentDate}>{moment().format('LL')}</div>
            <div className={tripManifestStyle.content}>
              <div className={tripManifestStyle.mainInfo}>
                <h1>Trip Manifest</h1>
                <div><QRCode value={trip.TripID + ''} /></div>
                <p>Trip ID</p>
                <h2>#{trip.TripID}</h2>
              </div>
              <div className={tripManifestStyle.addressCardContainer}>
                <div className={tripManifestStyle.addressCard}>
                  <div>
                    <p>From</p>
                    {
                      trip.PickupAddress !== null &&
                      trip.PickupAddress.Address1
                    }
                  </div>
                  <div>
                    <p>To</p>
                    {
                      trip.DropoffAddress !== null &&
                      trip.DropoffAddress.Address1
                    }
                  </div>
                </div>
              </div>
              {
                orders.length > 0 &&
                <table className={tripManifestStyle.orderTable}>
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Package Number</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      orders.map((order, i)=> {
                        return (
                          <tr key={i}>
                            <td>{order.UserOrderNumber}</td>
                            <td>{order.WebOrderID}</td>
                            <td>
                              {
                                order.PickupAddress !== null &&
                                <div>
                                  <p style={{'fontWeight':'600'}}>{order.PickupAddress.FirstName + ' ' + order.PickupAddress.LastName}</p>
                                  <p style={{'fontWeight':'600'}}>{order.PickupAddress.PickupMobile}</p>
                                  <p style={{'color':'rgba(0,0,0,0.5)'}}>{order.PickupAddress.Address1}</p>
                                </div>
                              }
                            </td>
                            <td>
                              {
                                order.DropoffAddress !== null &&
                                <div>
                                  <p style={{'fontWeight':'600'}}>{order.DropoffAddress.FirstName + ' ' + order.DropoffAddress.LastName}</p>
                                  <p style={{'fontWeight':'600'}}>{order.DropoffAddress.PickupMobile}</p>
                                  <p style={{'color':'rgba(0,0,0,0.5)'}}>{order.DropoffAddress.Address1}</p>
                                </div>
                              }
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              }
              <div style={{'textAlign': 'right'}}>
                <div style={{'width':'112px', 'textAlign':'center', 'display':'inline-block'}}>
                  <span>Acknowledge by,</span>
                  <div className={tripManifestStyle.signature}></div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
});

function StateToProps(store) {
  const {inboundTripDetails} = store.app;
  const {isFetching, orders, trip} = inboundTripDetails;

  return {
    isFetching,
    orders,
    trip
  }
}

function DispatchToProps(dispatch) {
  return {
    detailsFetch: function(id) {
      dispatch(TripDetailsTrue.FetchDetails(id));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(TripManifestPage);
