import login from './auth/actions/login';
import containers, {statusList} from './containers/actions';

export const LoginAction = {
  login: login
};

export const ContainersAction = containers;
export const StatusList = statusList;
