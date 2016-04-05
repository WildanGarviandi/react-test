import broadcast from './broadcast';
import containerActiveToggle from './containerActiveToggle';
import containerCreate from './containerCreate';
import {fetchContainers, setCurrentPage, setLimit} from './containersFetch';

export default {
  broadcast: broadcast,
  create: containerCreate,
  fetch: fetchContainers,
  setCurrentPage: setCurrentPage,
  setLimit: setLimit,
  toggleActive: containerActiveToggle
}
