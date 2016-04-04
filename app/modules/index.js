import login from './auth/actions/login';
import broadcast from './containers/actions/broadcast';
import containerActiveToggle from './containers/actions/containerActiveToggle';
import containerCreate from './containers/actions/containerCreate';
import containersFetch from './containers/actions/containersFetch';

export const LoginAction = {
  login: login
};

export const ContainerListAction = {
  broadcast: broadcast,
  create: containerCreate,
  fetch: containersFetch,
  toggleActive: containerActiveToggle
}
