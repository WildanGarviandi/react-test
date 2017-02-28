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

const DashboardMenu = ({activeMenuIdx, handleLogout, toggleCompact, hubID, loggedName, counterOrder, count, tmsMenu, switchMenu, isCentralHub}) => {
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
          </div>
        }
        { config.features.menuTMS && (tmsMenu || !hubID) &&
          <div>
          <Accordion initialState={'collapsed'}>
            <AccordionMenu activeMenuIdx={activeMenuIdx} activeMenuTarget={[7,8,9]} iconName={'shopping-cart'} iconTitle={'My Orders'}>
              <MenuItem active={activeMenuIdx == 7} to={'/myorders/open'}>
                 <Glyph className={styles.menuGlyph} name={'open-file'}/>
                 <span>Open Orders ({counterOrder.countOpen})</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 8} to={'/myorders/ongoing'}>
                 <Glyph className={styles.menuGlyph} name={'open-file'}/>
                 <span>Ongoing Orders ({counterOrder.countInProgress})</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 9} to={'/myorders/completed'}>
                 <Glyph className={styles.menuGlyph} name={'open-file'}/>
                 <span>Completed Orders ({counterOrder.countFinished})</span>
              </MenuItem>
            </AccordionMenu>
          </Accordion>
          <MenuItem active={activeMenuIdx == 10} to={'/mytrips'}>
           <Glyph className={styles.menuGlyph} name={'briefcase'}/>
           <span>My Trips</span>
          </MenuItem>
          <MenuItem active={activeMenuIdx == 11} to={'/mycontacts'}>
             <Glyph className={styles.menuGlyph} name={'book'}/>
             <span>My Contacts</span>
          </MenuItem>
          <MenuItem active={activeMenuIdx == 12} to={'/mydrivers'}>
            <Glyph className={styles.menuGlyph} name={'user'}/>
            <span>My Drivers</span>
          </MenuItem>
          </div>
        }
      </ul>
      <div className={styles.logoutSection}>
        <a className={styles.logoutButton} onClick={handleLogout}>
          <img src="/img/icon-logout.png" className={styles.menuLogout} />
          <span>Logout</span>
        </a>
      </div>
      { 
        // hubID &&
        // <center className={styles.menuTitle}>
        //   <a className={styles.switchLink} onClick={switchMenu}>
        //     <span>Switch to {tmsMenu ? 'Hub' : 'TMS'}</span>
        //   </a>
        // </center>
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
  '/myorders/open',
  '/myorders/ongoing',
  '/myorders/completed',
  '/mytrips',
  '/mycontacts',
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
    this.props.initialLoad();
    this.checkAuth();
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
    const {count} = store.app.dashboard;
    return {
      userLogged: userLogged,
      counterOrder: {
        countOpen: countOpen,
        countInProgress: countInProgress,
        countFinished: countFinished
      },
      count: count
    }
}

function DispatchToProps(dispatch) {
  return {
    initialLoad() {
      dispatch(FetchStatusList());
      dispatch(ContactService.FetchList());
      dispatch(CityService.FetchList());
      dispatch(StateService.FetchList());
      dispatch(OrderService.FetchCountOrder());
      dispatch(DashboardService.FetchCount());
      dispatch(FleetService.FetchList());
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
        dispatch(push('/myorders/open'));
      } else {
        dispatch(push('/orders/pickup'));
      }
    }
  }
}

export default connect(StoreToDashboard, DispatchToProps)(DashboardContainer);
