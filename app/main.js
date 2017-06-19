import 'babel-polyfill';
import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import './main.scss';
import routes from './routes';
import { IntlProvider } from 'react-intl-redux';
import ReactGA from 'react-ga';
import config from '../config.json'
ReactGA.initialize(config.googleAnalyticsKey);

const Root = () => {
  return (
    <Provider store={store}>
      <IntlProvider>
        {routes}
      </IntlProvider>
    </Provider>
  );
};

render(<Root />, document.getElementById('root'));
