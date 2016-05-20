import 'babel-polyfill';
import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import './main.css';
import routes from './routes';

const Root = () => {
  return (
    <Provider store={store}>
      {routes}
    </Provider>
  );
};

render(<Root />, document.getElementById('root'));
