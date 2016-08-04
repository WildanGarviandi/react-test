function GetList(state) {
  const {statusList} = state.app.containers;
  return _.chain(statusList)
    .map((key, val) => ({key:key, value: val.toUpperCase()}))
    .sortBy((arr) => (arr.key))
    .value();
}

export default {
  GetList,
}
