import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {AppLoadedActions, LogoutAction} from '../../modules';
import FetchStatusList from '../../modules/containers/actions/statusFetch';
import * as ContactService from '../../contacts/contactService';
import * as StateService from '../../states/stateService';
import {Glyph} from '../base';
import Accordion from '../base/accordion';
import styles from './styles.css';
import _ from 'underscore';

var classnaming = require('classnames/bind').bind(styles);

const MenuItem = ({active, children, to}) => {
  let className = classnaming('menuItem', {active: active});
  return (
    <li className={className}>
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

const DashboardMenu = ({activeMenuIdx, handleLogout, toggleCompact}) => {
  return (
    <div className={styles.menuPanel}>
      <h4 className={styles.menuTitle}>Etobee Hub</h4>
      <h4 className={styles.compactTitle}>EHub</h4>
      <ul className={styles.menuList}>
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
        <MenuItem active={activeMenuIdx == 5} to={'/mytrips'}>
           <Glyph className={styles.menuGlyph} name={'tent'}/>
           <span>My Trips</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 6} to={'/myorders'}>
           <Glyph className={styles.menuGlyph} name={'transfer'}/>
           <span>My Orders</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 7} to={'/mycontacts'}>
           <Glyph className={styles.menuGlyph} name={'book'}/>
           <span>My Contacts</span>
        </MenuItem>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <Glyph className={styles.glyphBackward} name={'log-out'}/>
            <span>Logout</span>
          </button>
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

const menuPaths = ['/orders/pickup', '/trips/inbound', '/orders/received', '/trips/outbound', '/history'];
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
    let {routes} = this.props;
    let activeMenuIdx = GetActiveMenuIdx(routes[routes.length-1].path);
    let panelClass = classnaming('panel', {compact: this.state.isCompact});

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={panelClass} >
          <DashboardMenu activeMenuIdx={activeMenuIdx} handleLogout={this.handleLogout} toggleCompact={this.toggleCompact} />
          <DashboardContent>{this.props.children}</DashboardContent>
        </div>
      </div>
    );
  }
});

function DispatchToProps(dispatch) {
  return {
    initialLoad() {
      dispatch(FetchStatusList());
      dispatch(ContactService.FetchList());
      dispatch(StateService.FetchList());
    },
    logout: function() {
      dispatch(LogoutAction.logout());
    }
  }
}

export default connect(undefined, DispatchToProps)(DashboardContainer);
