import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {AppLoadedActions} from '../../modules';
import FetchStatusList from '../../modules/containers/actions/statusFetch';

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
    const chevronType = accordionState === 'expanded' ? 'chevron-down' : 'chevron-up';
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
        <MenuItem active={activeMenuIdx == 0} to={'/container'}>
          <Glyph className={styles.menuGlyph} name={'briefcase'}/>
          <span>Container</span>
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

const menuPaths = ['/container'];
function GetActiveMenuIdx(path) {
  let fpath = _.find(menuPaths, (menu) => (path.indexOf(menu) > -1));
  let idx = menuPaths.indexOf(fpath);
  return Math.max(idx, 0);
}

const DashboardContainer = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  getInitialState() {
    return {isCompact: true};
  },
  componentWillMount() {
    this.props.initialLoad();
  },
  toggleCompact() {
    this.setState({isCompact: !this.state.isCompact});
  },
  handleLogout() {
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
      dispatch(AppLoadedActions.districtsFetch());
      dispatch(AppLoadedActions.driversFetch());
      dispatch(FetchStatusList());
    },
  }
}

export default connect(undefined, DispatchToProps)(DashboardContainer);
