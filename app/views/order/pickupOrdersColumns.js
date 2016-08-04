import lodash from 'lodash';
import {OrderConsumer} from '../../modules/orders/selector';

export const columns = ["IsChecked", "ID", "PickupTime", "PickupAddress", "OrderStatus"];

const conf = {
  Actions: {title: "Actions", cellType: "Actions"},
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "String"},
  IsChecked: {headerType: "Checkbox", cellType: "Checkbox"},
  NextDestination: {filterType: "String", title: "Next Destination", cellType: "String"},
  OrderStatus: {filterType: "StatusDropdown", title: "Order Status", cellType: "String"},
  PickupAddress: {filterType: "String", title: "Pickup Address", cellType: "String"},
  PickupTime: {filterType:"String", title: "Pickup Time", cellType: "String"},
  RouteStatus: {filterType: "StatusDropdown", title: "Route Status", cellType: "String"},
  ZipCode: {filterType: "String", title: "Zip Code"},
}

export const headers = lodash.map(columns, (column) => {
  return {keyword: column, type: conf[column].headerType, header: conf[column]};
});

export const filters = lodash.map(columns, (column) => {
  return {keyword: column, type: conf[column].filterType};
});

export const body = lodash.map(columns, (column) => {
  return {keyword: column, type: conf[column].cellType};
});

function RowConsumer(type, item) {
  switch(type) {
    case "CODValue": {
      return OrderConsumer.GetCODValue(item);
    }

    case "DropoffAddress": {

    }

    case "Actions":
    default: return item;
  }
}

export function ToPickupOrdersRow(item) {
  return lodash.map(columns, (column) => {
    return
  });
}
