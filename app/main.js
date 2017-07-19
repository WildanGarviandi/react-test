import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl-redux';
import ReactGA from 'react-ga';

import 'babel-polyfill';

import store from './store';
import './main.scss';
import routes from './routes';
import config from '../config.json';

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
