import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {AppLoadedActions, LogoutAction} from '../modules';
import checkAuth from '../modules/auth/actions/checkAuth';
import store from '../store';
import FetchStatusList from '../modules/containers/actions/statusFetch';
import * as ContactService from '../contacts/contactService';
import * as StateService from '../states/stateService';
import * as CityService from '../cities/cityService';
import * as OrderService from '../orders/orderService';
import * as DashboardService from './dashboardService';
import * as FleetService from '../nearbyFleets/nearbyFleetService';
import {Glyph} from '../views/base';
import Accordion from '../views/base/accordion';
import styles from './styles.css';
import _ from 'underscore';
import config from '../../config.json';
import configValues from '../config/configValues.json';
import {push} from 'react-router-redux';
import ModalActions from '../modules/modals/actions';

var classnaming = require('classnames/bind').bind(styles);
let interval = null;

const MenuItem = ({active, children, to, onClick}) => {
  let className = classnaming('menuItem', {active: active});
  return (
    <li onClick={onClick} className={className}>
      <Link className={styles.link} to={to}>{children}</Link>
    </li>
  );
};

const AccordionMenu = React.createClass({
  render() {
    const {accordionAction, accordionState, activeMenuIdx, activeMenuTarget, iconName, iconTitle} = this.props;
    const isActive = _.includes(activeMenuTarget, activeMenuIdx);

    const chevronStyle = classnaming('menuGlyph', 'chevron');
    const chevronType = accordionState === 'expanded' ? 'chevron-up' : 'chevron-down';
    const className = classnaming('menuItem', 'accItem', {active: isActive});

    return (
      <div className={styles.accWrapper}>
        <div onClick={accordionAction.toggleView} className={className}>
          <Glyph className={styles.menuGlyph} name={iconName}/>
          <Glyph className={chevronStyle} name={chevronType}/>
          <span>{iconTitle}</span>
        </div>
        {
          accordionState === 'expanded' &&
          <div className={styles.menuAccordion}>{this.props.children}</div>
        }
      </div>
    );
  }
})

const DashboardMenu = ({activeMenuIdx, handleLogout, toggleCompact, hubID, loggedName, counterOrder, count, countTMS, tmsMenu, switchMenu, isCentralHub}) => {
  return (
    <div className={styles.menuPanel}>
      <img src="/img/logo.png" className={styles.menuLogo} />
      <h5 className={styles.menuTitle}>{loggedName}</h5>
      <h4 className={styles.compactTitle}>{tmsMenu ? 'E-TMS' : 'E-Hub'}</h4>
      <ul className={styles.menuList}>
        { hubID && !tmsMenu &&
          <div>
            <MenuItem active={activeMenuIdx == 0} to={'/orders/pickup'}>
              <img src="/img/icon-pickup-orders.png" className={styles.menuGlyph} />
              <span>Pickup Orders </span>
              <span className={styles.counterNumber}>{count && count.pickup}</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 1} to={'/trips/inbound'}>
              <img src="/img/icon-inbound-trip.png" className={styles.menuGlyph} />
              <span>Inbound Trip </span>
              <span className={styles.counterNumber}>{count && count.inboundTrip}</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 2} to={'/inbound'}>
              <img src="/img/icon-inbound.png" className={styles.menuGlyph} />
              <span>Inbound </span>
              <span className={styles.counterNumber}>{count && count.unscannedOrders}</span>
            </MenuItem>
            { config.features.menuUpdateOrder && isCentralHub &&
              <MenuItem active={activeMenuIdx == 3} to={'/orders/update'}>
                <img src="/img/icon-update-order.png" className={styles.menuGlyph} />
                <span>Update Order </span>
                <span className={styles.counterNumber}>{count && count.updateOrders}</span>
              </MenuItem>
            }
            <MenuItem active={activeMenuIdx == 4} to={'/grouping'}>
              <img src="/img/icon-grouping.png" className={styles.menuGlyph} />
              <span>Grouping </span>
              <span className={styles.counterNumber}>{count && count.receivedOrders}</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 5} to={'/trips/outbound'}>
              <img src="/img/icon-outbound.png" className={styles.menuGlyph} />
              <span>Outbound Trips </span>
              <span className={styles.counterNumber}>{count && count.outboundTrip}</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 6} to={'/history'}>
              <img src="/img/icon-trip-history.png" className={styles.menuGlyph} />
              <span>Trips History</span>
            </MenuItem>
            <MenuItem onClick={handleLogout} to={'/'}>
                <img src="/img/icon-logout.png" className={styles.menuGlyph} />
                <span>Logout</span>
            </MenuItem>
          </div>
        }
        { config.features.menuTMS && (tmsMenu || !hubID) &&
          <div>
            <div className={styles.titlePanel}>
              <span className={styles.titleMenu}>
                My Jobs
              </span>
              <hr className={styles.menuSeparator} />
              <MenuItem active={activeMenuIdx == 7} to={'/myorders'}>
                <img src="/img/icon-orders.png" className={styles.menuGlyph} />
                <span>My Orders</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 8} to={'/mytrips'}>
                <img src="/img/icon-my-trips.png" className={styles.menuGlyph} />
                <span>My Trips</span>
                <span className={styles.counterNumber}>{countTMS && countTMS.NotAssigned}</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 9} to={'/myongoingtrips'}>
                <img src="/img/icon-ongoing-trips.png" className={styles.menuGlyph} />
                <span>My Ongoing Trips</span>
                <span className={styles.counterNumber}>{countTMS && countTMS.NotDelivered}</span>
              </MenuItem>
            </div>
            <div className={styles.titlePanel}>
              <span className={styles.titleMenu}>
                Others
              </span>
              <hr className={styles.menuSeparator} />
              <MenuItem active={activeMenuIdx == 10} to={'/mydrivers'}>
                <img src="/img/icon-driver.png" className={styles.menuGlyph} />
                <span>My Drivers</span>
              </MenuItem>
            </div>
            { /*<div className={styles.titlePanel}>
              <span className={styles.titleMenu}>
                Others
              </span>
              <hr className={styles.menuSeparator} />
              <MenuItem active={activeMenuIdx == 12} to={'/mycontacts'}>
                <img src="/img/icon-trip-history.png" className={styles.menuGlyph} />
                <span>My Contacts</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 13} to={'/mydrivers'}>
                <img src="/img/icon-trip-history.png" className={styles.menuGlyph} />
                <span>My Drivers</span>
              </MenuItem>
            </div> */ }
            <div className={styles.titlePanel}>
              <MenuItem onClick={handleLogout} to={'/'}>
                  <img src="/img/icon-logout.png" className={styles.menuGlyph} />
                  <span>Logout</span>
              </MenuItem>
            </div>
          </div>
        }
      </ul>
      { 
         hubID &&
         <div>
           <a className={styles.switchLink} onClick={switchMenu}>
              <img src="/img/icon-switch.png" className={styles.menuSwitch} />
             <span>Switch to {tmsMenu ? 'Hub' : 'TMS'}</span>
           </a>
         </div>
      }
    </div>
  );
}

const DashboardContent = ({children}) => {
  return (<div className={styles.content}>{children}</div>);
}

const menuPaths = [
  '/orders/pickup',
  '/trips/inbound',
  '/inbound',
  '/orders/update',
  '/grouping',
  '/trips/outbound',
  '/history',
  '/myorders',
  '/mytrips',
  '/myongoingtrips',
  '/mydrivers'
];

const menuPathsTMS = [
  '/myorders',
  '/myorders/add',
  '/mytrips',
  '/myongoingtrips',
  '/mydrivers'
];

function GetActiveMenuIdx(path) {
  let fpath = _.find(menuPaths, (menu) => (path.indexOf(menu) > -1));
  let idx = menuPaths.indexOf(fpath);
  return idx;
}

const DashboardContainer = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  getInitialState() {
    return {isCompact: false, tmsMenu: this.props.hubID};
  },
  componentWillMount() {
    this.props.initialLoad(this.props.userLogged.hubID);
    //this.checkAuth();
    if (menuPathsTMS.indexOf(this.props.location.pathname) > -1) {
      this.setState({tmsMenu: true});
    }
  },
  toggleCompact() {
    this.setState({isCompact: !this.state.isCompact});
  },
  handleLogout() {
    this.props.logout();
  },
  switchMenu() {
    this.setState({tmsMenu: !this.state.tmsMenu});
    this.props.switchMenu(!this.state.tmsMenu);
  },
  checkAuth() {
    interval = setInterval(function() {
      this.props.checkAuth();
    }.bind(this), 10000);
  },
  render() {
    let {routes, userLogged} = this.props;
    let {hubID, hubName, fleetName, isCentralHub} = userLogged;
    let activeMenuIdx = GetActiveMenuIdx(routes[routes.length-1].path);
    let panelClass = classnaming('panel', {compact: this.state.isCompact});
    const loggedName = hubID ? `${fleetName} \n ${hubName}` : `${fleetName}`;

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={panelClass} >
          <DashboardMenu 
            activeMenuIdx={activeMenuIdx} 
            handleLogout={this.handleLogout} 
            toggleCompact={this.toggleCompact} 
            hubID={hubID} 
            loggedName={loggedName} 
            counterOrder={this.props.counterOrder}
            count={this.props.count}
            countTMS={this.props.countTMS}
            tmsMenu={this.state.tmsMenu}
            switchMenu={this.switchMenu}
            isCentralHub={isCentralHub} />
          <DashboardContent>{this.props.children}</DashboardContent>
        </div>
      </div>
    );
  }
});

function StoreToDashboard(store) {
    const userLogged = store.app.userLogged;
    const {countOpen, countInProgress, countFinished} = store.app.myOrders;
    const {count, countTMS} = store.app.dashboard;
    return {
      userLogged: userLogged,
      counterOrder: {
        countOpen: countOpen,
        countInProgress: countInProgress,
        countFinished: countFinished
      },
      count: count,
      countTMS: countTMS
    }
}

function DispatchToProps(dispatch) {
  return {
    initialLoad(hubID) {
      dispatch(FetchStatusList());
      dispatch(ContactService.FetchList());
      dispatch(CityService.FetchList());
      dispatch(StateService.FetchList());
      dispatch(DashboardService.FetchCountTMS());
      if (hubID) {
        dispatch(DashboardService.FetchCount());
        dispatch(FleetService.FetchList());
      }
    },
    logout: function() {
      clearInterval(interval);
      dispatch(LogoutAction.logout());
    },
    checkAuth: function() {
      checkAuth(store).then(function(result) {
        if(!result.ok) {
          dispatch(ModalActions.addMessage('Your session has been expired. Please login again.'));
          clearInterval(interval);
          dispatch(push('/login'));
        }
      })
    },
    switchMenu: function(tmsMenu) {
      if (tmsMenu) {
        dispatch(push(configValues.defaultMainPageTMS));
      } else {
        dispatch(push(configValues.defaultMainPage));
      }
    }
  }
}

export default connect(StoreToDashboard, DispatchToProps)(DashboardContainer);