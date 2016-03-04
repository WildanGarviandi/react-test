import React from 'react';
import {Link} from 'react-router';
import {ButtonBase, Glyph, InputText, Modal} from '../base';
import {HubComponent, MyOrderComponent} from '../order';
import styles from './styles.css';

var classnaming = require('classnames/bind').bind(styles);

const MenuItem = ({active, children, to}) => {
  let className = classnaming('menuItem', {active: active});
  return (
    <li className={className}>
      <Link className={styles.link} to={to}>{children}</Link>
    </li>
  );
}

const DashboardMenu = ({activeMenuIdx, toggleCompact}) => {
  return (
    <div className={styles.menuPanel}>
      <h4 className={styles.menuTitle}>Etobee Hub</h4>
      <h4 className={styles.compactTitle}>EHub</h4>
      <ul className={styles.menuList}>
        <MenuItem active={activeMenuIdx == 0} to={'/myOrder'}>
          <Glyph className={styles.menuGlyph} name={'list-alt'}/>
          <span>My Order</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 1} to={'/hubOrder'}>
          <Glyph className={styles.menuGlyph} name={'home'}/>
          <span>Hub Order</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 2} to={'/container'}>
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

const menuPaths = ['/myOrder', '/hubOrder', '/container'];
function GetActiveMenuIdx(path) {
  let idx = menuPaths.indexOf(path);
  return Math.max(idx, 0);
}

const DashboardContainer = React.createClass({
  getInitialState() {
    return {isCompact: true};
  },
  toggleCompact() {
    this.setState({isCompact: !this.state.isCompact});
  },
  render() {
    let {routes} = this.props;
    let activeMenuIdx = GetActiveMenuIdx(routes[routes.length-1].path);
    let panelClass = classnaming('panel', {compact: this.state.isCompact});

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={panelClass} >
          <DashboardMenu activeMenuIdx={activeMenuIdx} toggleCompact={this.toggleCompact} />
          <DashboardContent>{this.props.children}</DashboardContent>
        </div>
      </div>
    );
  }
});

export default DashboardContainer;
