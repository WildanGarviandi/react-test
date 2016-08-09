import lodash from 'lodash';

export const conf = {
  Actions: {title: "Actions", cellType: "Actions"},
  DropoffAddress: {filterType: "String", title: "Dropoff Address", cellType: "String"},
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "Link"},
  IsChecked: {headerType: "Checkbox", cellType: "Checkbox"},
  NextDestination: {filterType: "String", title: "Next Destination", cellType: "String"},
  OrderStatus: {filterType: "StatusDropdown", title: "Order Status", cellType: "String"},
  PickupAddress: {filterType: "String", title: "Pickup Address", cellType: "String"},
  PickupTime: {title: "Pickup Time", cellType: "String"},
  RouteStatus: {filterType: "StatusDropdown", title: "Route Status", cellType: "String"},
  UserOrderNumber: {filterType: "String", title: "AWB", cellType: "Link"},
  WebOrderID: {filterType: "String", title: "Web Order ID", cellType: "String"},
  WebstoreName: {filterType: "String", title: "Webstore Name", cellType: "String"},
  ZipCode: {filterType: "String", title: "Zip Code"},
}

export const pickupOrdersColumns = ["IsChecked", "ID", "WebstoreName", "PickupTime", "PickupAddress", "OrderStatus"];

export const receivedOrdersColumns = ["IsChecked", "ID", "WebstoreName", "PickupTime", "DropoffAddress", "RouteStatus", "ZipCode"];

export const orderDetails = ["UserOrderNumber", "WebOrderID", "User", "PickupType", "RouteStatus", "PickupTime", "PickupAddress", "DropoffTime", "DropoffAddress", "PackageWeight", "PackageLength", "PackageWidth", "PackageHeight", "OrderCost", "FinalCost", "VAT", "IncludeInsurance", "TotalValue", "UseExtraHelper", "EtobeeShare", "DriverShare", "LogisticShare"];
