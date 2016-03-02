import React from 'react';
import {Link} from 'react-router';
import {ButtonBase, Glyph, InputText, Modal} from '../base';
import {HubComponent, MyOrderComponent} from '../order';
import styles from './styles.css';

var classnaming = require('classnames/bind').bind(styles);

const ScanComp = ({hideModal}) => {
  return (
    <div>
      <h3 style={{marginTop:0, marginBottom: '10px'}}>Scan Container</h3>
      <div>
        <label className={styles.scanLabel}>Container ID : </label>
        <InputText className={styles.scanInput} />
      </div>
      <ButtonBase className={styles.scanBtn} onClick={hideModal}>Confirm</ButtonBase>
    </div>
  );
}

const DashboardPage = React.createClass({
  getInitialState() {
    return {activeMenuIdx: 0}
  },
  setMenu(x) {
    this.setState({activeMenuIdx: x});
  },
  render() {
    let {activeMenuIdx} = this.state;

    let ContentComp;
    if(activeMenuIdx == 0) {
      ContentComp = <MyOrderComponent />;
    } else {
      ContentComp = <HubComponent />;
    }

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={styles.panel} >
          <Menus active={this.state.activeMenuIdx} setMenu={this.setMenu} />
          <div className={styles.content}>
            {ContentComp}
          </div>
          <div style={{clear: "both"}}></div>
        </div>
      </div>
    );
  }
});

const MenuItem = ({active, children, to}) => {
  let className = classnaming('menuItem', {active: active});
  return (
    <li className={className}>
      <Link className={styles.link} to={to}>{children}</Link>
    </li>
  );
}

const DashboardMenu = ({activeMenuIdx}) => {
  return (
    <div className={styles.menuPanel}>
      <h4 className={styles.menuTitle} >Etobee Hub</h4>
      <ul className={styles.menuList}>
        <MenuItem active={activeMenuIdx == 0} to={'/myOrder'}>
          <Glyph className={styles.menuGlyph} name={'list-alt'}/>
          <span>My Order</span>
        </MenuItem>
        <MenuItem active={activeMenuIdx == 1} to={'/hubOrder'}>
          <Glyph className={styles.menuGlyph} name={'home'}/>
          <span>Hub Order</span>
        </MenuItem>
      </ul>
    </div>
  );
}

const DashboardContent = ({children}) => {
  return (<div className={styles.content}>{children}</div>);
}

const menuPaths = ['/myOrder', '/hubOrder'];
function GetActiveMenuIdx(path) {
  let idx = menuPaths.indexOf(path);
  return Math.max(idx, 0);
}

const DashboardContainer = React.createClass({
  render() {
    let {routes} = this.props;
    let activeMenuIdx = GetActiveMenuIdx(routes[routes.length-1].path);

    return (
      <div style={{display: 'table', width: '100%', minHeight: '100%'}}>
        <div className={styles.panel} >
          <DashboardMenu activeMenuIdx={activeMenuIdx} />
          <DashboardContent>{this.props.children}</DashboardContent>
        </div>
      </div>
    );
  }
});

export default DashboardContainer;
