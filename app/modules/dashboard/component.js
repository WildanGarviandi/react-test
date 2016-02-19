import React from 'react';
import styles from './styles.css';
import { ButtonBase } from '../base/component';

var classnaming = require('classnames/bind').bind(styles);

function ButtonMenus(props) {
  return (<ButtonBase className={styles.button}>{props.children}</ButtonBase>);
}

const MenuItem = React.createClass({
  handleClick() {
    let { id, setActive } = this.props;
    if(!setActive) return;
    setActive(id);
  },
  render() {
    var { active } = this.props;

    var itemClass = classnaming('menuItem',{
      'active': active
    });

    return (
      <li className={itemClass} onClick={this.handleClick}>{this.props.children}</li>
    );
  }
});

const Menus = React.createClass({
  getInitialState() {
    return({active: -1});
  },
  setActiveItem(id) {
    console.log('id', id);
    this.setState({active: id});
  },
  render() {
    let {active} = this.state;
    return (
      <div className={styles.menuPanel}>
        <h4 className={styles.title} >Etobee Hub</h4>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <ButtonMenus>Scan</ButtonMenus>
          </li>
          <MenuItem active={active == 0} id={0} setActive={this.setActiveItem} className={styles.menuItem}>My Order</MenuItem>
          <MenuItem active={active == 1} id={1} setActive={this.setActiveItem} className={styles.menuItem}>Hub Order</MenuItem>
          <li className={styles.menuItem}>
            <ButtonMenus>Seal</ButtonMenus>
          </li>
        </ul>
      </div>
    );
  }
});

const DashboardPage = React.createClass({
  render() {
    return (
      <div className={styles.panel} >
        <Menus />
      </div>
    );
  }
});

export { DashboardPage };
