import React from 'react';
import { render } from 'react-dom';
import { LoginPanel } from './component/login';
import styles from './styles/core.css';

const LoginPage = React.createClass({
  render() {
    return (
      <div className={styles.page} >
        <Logo />
        <LoginPanel />
      </div>
    );
  }
});

const Logo = React.createClass({
  render() {
    return (
      <div className={styles.logo} >
      </div>
    );
  }
});

render(<LoginPage />, document.getElementById('root'));
