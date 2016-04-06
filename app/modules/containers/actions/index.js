import broadcast from './broadcast';
import containerActiveToggle from './containerActiveToggle';
import containerCreate from './containerCreate';
import {fetchContainers, setCurrentPage, setLimit, setStatus} from './containersFetch';
import fetchStatus from './statusFetch';

export const statusList = {
  fetch: fetchStatus,
  pick: setStatus
};

export default {
  broadcast: broadcast,
  create: containerCreate,
  fetch: fetchContainers,
  setCurrentPage: setCurrentPage,
  setLimit: setLimit,
  setStatus: setStatus,
  toggleActive: containerActiveToggle
};
