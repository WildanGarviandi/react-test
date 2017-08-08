# Etobee Hub

## Description

Etobee web application for managing inbound, processing, and outbound orders 

## Technologies
- React 15.5.4 (JS Framework)
- Webpack 2.6.1 (Module Bundler)
- ESLint 3.19.0 and ESLint Config AirBnb 15.0.1 (Linter and Code Style)
- Lodash 4.17.4 (Data Manipulation)
- Moment 2.18.1 (Date Utility)
- Redux 3.6.0 (State Management)
- React Bootstrap 0.28.5
- React Router 2.8.1
- Reselect 3.0.1 (Redux Selector)
- SASS (CSS Preprocessor)
- Jest 20.0.4 (Unit Testing Library)
- Enzyme 2.9.1 (Unit Testing Utility)
- Redux Raven Middleware 1.2.0 (Error Report Middleware)

## Configuration

- Copy config.json.example to config.json
- Put app configuration there

## Prerequisite:

Install [Node.js and npm](https://nodejs.org/en/)

Minimum:
- node v5.x.x (Stable version is 5.1.1) or higher and npm 3.x.x or higher.
- To check which version you are using, run node -v and npm -v in a terminal window.

Add [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) for debugging application's state changes

## Installation and Run

- Clone Repository
```
git clone git@gitlab.com:etobee-techgroup/etobee-hub.git
```

- Install [yarn](https://yarnpkg.com/en/) globally
```
npm install -g yarn
```

- Install Dependencies
```
yarn
```

- Run for Development
```
npm run dev
```

- Build and Run for Production
```
npm run build
npm run server
```

## [Project Structure](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1)

Our goals will look like this:
```
/app
  /config
    /configValues.js
  /components
    /Accordion
      /index.jsx
    /Button
      /index.jsx
  /services
    /auth
      index.js
  /scenes
    /ChooseHub
    /InboundTrips
      /components
        /Table
          /index.jsx
        /Modal
          /index.jsx
      /index.jsx
```
Where:
- `app/config` contains all config
- `app/components` contains reusable components
- `app/scenes/PageComponent/components` contains component that will be used by `PageComponent`
- `app/scenes` contains page components (`PageComponent`)
- `app/services` contains services
- `app/services/auth/index.js` contains actions, reducers, and action creators



## Style Guide

```
WARNING: This guide is subject to be changed.
Guide Example: Login and DragDropImageUploader Component
```

- React
Use [AirBnB React Style Guide](https://github.com/airbnb/javascript/tree/master/react#alignment)

- Redux
Use [Ducks Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux)
```
MUST export default a function called reducer()
MUST export its action creators as functions
MUST have action types in the form npm-module-or-app/reducer/ACTION_TYPE
MAY export its action types as UPPER_SNAKE_CASE, if an external reducer needs to listen for them, or if it is a published reusable library
```

- Redux Selector
Use [Selector](https://github.com/reactjs/reselect) for Redux performance

- Error Report Middleware Use [Redux Raven Middleware](https://github.com/captbaritone/raven-for-redux)

```
DON'T FORGET TO DISPATCH ERROR IN CATCH STATEMENT IF API REQUEST IS FAILED
```

- Action Format
Use [Flux Standard Action](https://github.com/acdlite/flux-standard-action)

```
MUST
be a plain JavaScript object.
have a type property.
```
```
MAY
have an error property.
have a payload property.
have a meta property.
```
```
MUST NOT
include properties other than type, payload, error, and meta
```

- CSS Format
Use [AirBnb CSS/SASS Style Guide](https://github.com/airbnb/css)