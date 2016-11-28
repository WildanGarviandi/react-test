import broadcast from './broadcast';
import containerActiveToggle from './containerActiveToggle';
import containerCreate from './containerCreate';
import containerDetails from './containerDetailsFetch';
import containerEmpty from './containerEmpty';
import containerFill from './containerFill';
import {fetchContainers, setCurrentPage, setLimit, setStatus} from './containersFetch';
import districtSet from './districtSet';
import driverSet from './driverSet';
import fetchStatus from './statusFetch';

export const statusList = {
  fetch: fetchStatus,
  pick: setStatus
};

export default {
  broadcast: broadcast,
  create: containerCreate,
  empty: containerEmpty,
  fetch: fetchContainers,
  fetchDetails: containerDetails,
  fill: containerFill,
  setCurrentPage: setCurrentPage,
  setLimit: setLimit,
  setStatus: setStatus,
  toggleActive: containerActiveToggle,
  districtSet, districtSet,
  driverSet: driverSet,
};
