import login from './auth/actions/login';
import logout from './auth/actions/logout';
import containers, {statusList} from './containers/actions';
import districts from './districts/actions';
import drivers from './drivers/actions';
import modals from './modals/actions';

export const LoginAction = {
  login: login,
};

export const LogoutAction = {
  logout: logout,
};

export const ContainersAction = containers;
export const StatusList = statusList;

export const FillActions = {
  fetchDrivers: drivers.fetch,
  fillContainer: containers.fill,
}

export const ContainerDetailsActions = {
  clearContainer: containers.empty,
  fetchDetails: containers.fetchDetails,
  fetchDrivers: drivers.fetch,
  pickDriver: drivers.pick,
  deassignDriver: drivers.deassign,
}

export const ModalActions = {
  addError: modals.addError,
  addModal: modals.addModal,
  closeModal: modals.closeModal,
}

export const DriversActions = {
  driverSet: containers.driverSet,
}

export const DistrictsActions = {
  districtSet: containers.districtSet,
}

export const AppLoadedActions = {
  districtsFetch: districts.districtsFetch,
  driversFetch: drivers.driversFetch,
}
