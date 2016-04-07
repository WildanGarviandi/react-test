import login from './auth/actions/login';
import containers, {statusList} from './containers/actions';
import drivers from './drivers/actions';

export const LoginAction = {
  login: login
};

export const ContainersAction = containers;
export const StatusList = statusList;

export const FillActions = {
  fetchDrivers: drivers.fetch,
  fillContainer: containers.fill
}

export const ContainerDetailsActions = {
  clearContainer: containers.empty,
  fetchDetails: containers.fetchDetails
}
