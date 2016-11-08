import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {AppLoadedActions, LogoutAction} from '../../modules';
import FetchStatusList from '../../modules/containers/actions/statusFetch';
import * as ContactService from '../../contacts/contactService';
import * as StateService from '../../states/stateService';
import * as CityService from '../../cities/cityService';
import * as OrderService from '../../orders/orderService';
import {Glyph} from '../base';
import Accordion from '../base/accordion';
import styles from './styles.css';
import _ from 'underscore';

var classnaming = require('classnames/bind').bind(styles);

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

const DashboardMenu = ({activeMenuIdx, handleLogout, toggleCompact, hubID, loggedName, counterOrder}) => {
  return (
    <div className={styles.menuPanel}>
      <h4 className={styles.menuTitle}>Etobee TMS</h4>
      <h5 className={styles.menuTitle}>{loggedName}</h5>
      <h4 className={styles.compactTitle}>ETMS</h4>
      <ul className={styles.menuList}>
        { hubID &&
          <div>
          <Accordion initialState={'collapsed'}>
            <AccordionMenu activeMenuIdx={activeMenuIdx} activeMenuTarget={[0,1]} iconName={'list-alt'} iconTitle={'Inbound'}>
              <MenuItem active={activeMenuIdx == 0} to={'/orders/pickup'}>
                <Glyph className={styles.menuGlyph} name={'alert'}/>
                <span>Pickup Orders</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 1} to={'/trips/inbound'}>
                <Glyph className={styles.menuGlyph} name={'tasks'}/>
                <span>Inbound Trips</span>
              </MenuItem>
            </AccordionMenu>
          </Accordion>
          <Accordion initialState={'collapsed'}>
            <AccordionMenu activeMenuIdx={activeMenuIdx} activeMenuTarget={[2,3]} iconName={'barcode'} iconTitle={'Outbound'}>
              <MenuItem active={activeMenuIdx == 2} to={'/orders/received'}>
                <Glyph className={styles.menuGlyph} name={'transfer'}/>
                <span>Received Orders</span>
              </MenuItem>
              <MenuItem active={activeMenuIdx == 3} to={'/trips/outbound'}>
                <Glyph className={styles.menuGlyph} name={'road'}/>
                <span>Outbound Trips</span>
              </MenuItem>
            </AccordionMenu>
          </Accordion>
          <MenuItem active={activeMenuIdx == 4} to={'/history'}>
            <Glyph className={styles.menuGlyph} name={'folder-open'}/>
            <span>Trips History</span>
          </MenuItem>
          </div>
        }
        <Accordion initialState={'collapsed'}>
          <AccordionMenu activeMenuIdx={activeMenuIdx} activeMenuTarget={[5,9,10]} iconName={'shopping-cart'} iconTitle={'My Orders'}>
            <MenuItem active={activeMenuIdx == 5} to={'/myorders/open'}>
               <Glyph className={styles.menuGlyph} name={'open-file'}/>
               <span>Open Orders ({counterOrder.countOpen})</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 9} to={'/myorders/ongoing'}>
               <Glyph className={styles.menuGlyph} name={'open-file'}/>
               <span>Ongoing Orders ({counterOrder.countInProgress})</span>
            </MenuItem>
            <MenuItem active={activeMenuIdx == 10} to={'/myorders/completed'}>
               <Glyph className={styles.menuGlyph} name={'open-file'}/>
               <span>Completed Orders ({counterOrder.countFinished})</span>
            </MenuItem>
          </AccordionMenu>
        </Accordion>
        <MenuItem active={activeMenuIdx == 6} to={'/mytrips'}>
         <Glyph className={styles.menuGlyph} name={'briefcase'}/>
         <span>My Trips</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 7} to={'/mycontacts'}>
           <Glyph className={styles.menuGlyph} name={'book'}/>
           <span>My Contacts</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 8} to={'/mydrivers'}>
          <Glyph className={styles.menuGlyph} name={'user'}/>
          <span>My Drivers</span>
        </MenuItem>
        <MenuItem to={''} onClick={handleLogout}>
          <Glyph className={styles.menuGlyph} name={'log-out'}/>
          <span>Logout</span>
        </MenuItem>
      </ul>
      <button className={styles.toggleMenu} onClick={toggleCompact}>
        <Glyph className={styles.glyphBackward} name={'backward'}/>
        <Glyph className={styles.glyphForward} name={'forward'}/>
      </button>
    </div>
  );
}

const DashboardContent = ({children}) => {
  return (<div className={styles.content}>{children}</div>);
}

const menuPaths = [
  '/orders/pickup',
  '/trips/inbound',
  '/orders/received',
  '/trips/outbound',
  '/history',
  '/myorders/open',
  '/mytrips',
  '/mycontacts',
  '/mydrivers',
  '/myorders/ongoing',
  '/myorders/completed'
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
    return {isCompact: false};
  },
  componentWillMount() {
    this.props.initialLoad();
  },
  toggleCompact() {
    this.setState({isCompact: !this.state.isCompact});
  },
  handleLogout() {
    this.props.logout();
  },
  render() {
    let {routes, userLogged} = this.props;
    let {hubID, hubName, fleetName} = userLogged;
    let activeMenuIdx = GetActiveMenuIdx(routes[routes.length-1].path);
    let panelClass = classnaming('panel', {compact: this.state.isCompact});
    const loggedName = hubID ? `${hubName} - ${fleetName}` : `${fleetName}`;

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={panelClass} >
          <DashboardMenu activeMenuIdx={activeMenuIdx} handleLogout={this.handleLogout} toggleCompact={this.toggleCompact} hubID={hubID} loggedName={loggedName} counterOrder={this.props.counterOrder} />
          <DashboardContent>{this.props.children}</DashboardContent>
        </div>
      </div>
    );
  }
});

function StoreToDashboard(store) {
    const userLogged = store.app.userLogged;
    const {countOpen, countInProgress, countFinished} = store.app.myOrders;
    return {
        userLogged: userLogged,
        counterOrder: {
          countOpen: countOpen,
          countInProgress: countInProgress,
          countFinished: countFinished
        }
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
    },
    logout: function() {
      dispatch(LogoutAction.logout());
    }
  }
}

export default connect(StoreToDashboard, DispatchToProps)(DashboardContainer);
