import React, { Component } from 'react';
import Map from './components/Map';

class DriverMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDriver: null,
      drivers: [
        {
          DriverCurrentLocationID: 14,
          DriverCurrentLocationGUID: '439376F9-104B-44BD-A5A7-E4DDE68EEE67',
          Latitude: -6.3375218,
          Longitude: 106.6801083,
          Driver: {
            PictureUrl:
              'http://midgard.etobee.com/content/profileimg/Low_undefined',
            UserID: 1303,
            FirstName: 'Sander',
            LastName: 'Van Der Veen',
            Email: '',
            PhoneNumber: '81299259062',
            Driver: {
              CompanyDetailID: 1076,
              CompanyDetail: {
                CompanyName: 'etobee',
              },
            },
          },
          NumberOfOrders: 2,
          isAvailable: true,
        },
        {
          DriverCurrentLocationID: 18,
          DriverCurrentLocationGUID: '98FFD185-9E57-4AFB-A966-D3E7F930080F',
          Latitude: -6.1946777,
          Longitude: 106.9112259,
          Driver: {
            PictureUrl:
              'http://midgard.etobee.com/content/profileimg/Low_undefined',
            UserID: 1305,
            FirstName: 'iras',
            LastName: 'brrr',
            Email: 'irawati@brrlogistic.com',
            PhoneNumber: '87788146644',
            Driver: {
              CompanyDetailID: 1076,
              CompanyDetail: {
                CompanyName: 'etobee',
              },
            },
          },
          NumberOfOrders: 5,
          isAvailable: false,
        },
      ],
    };

    this.onMapLoad = this.onMapLoad.bind(this);
    this.openDetails = this.openDetails.bind(this);
  }

  onMapLoad() {
    console.log('onmapload');
  }

  openDetails(id) {
    this.setState({ selectedDriver: id });
  }

  render() {
    return (
      <div>
        <span>This is driver maps</span>
        <Map
          openDetails={this.openDetails}
          onMapLoad={this.onMapLoad}
          drivers={this.state.drivers}
          selectedDriver={this.state.selectedDriver}
        />
      </div>
    );
  }
}

export default DriverMap;
