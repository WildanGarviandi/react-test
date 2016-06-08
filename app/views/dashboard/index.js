import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import {AppLoadedActions} from '../../modules';
import FleetsFetch from '../../modules/drivers/actions/fleetsFetch';

import {Glyph} from '../base';
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

export default DashboardContainer;
