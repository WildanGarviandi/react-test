import lodash from 'lodash';

export const conf = {
  Actions: {title: "Actions", cellType: "Actions"},
  DriverShare: {title: "Driver Share"},
  DropoffAddress: {filterType: "String", title: "Dropoff Address", cellType: "String"},
  DropoffTime: {title: "Dropoff Time"},
  EtobeeShare: {title: "Etobee Share"},
  FinalCost: {title: "Final Cost"},
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "Link"},
  IncludeInsurance: {title: "Include Insurance"},
  IsChecked: {headerType: "Checkbox", cellType: "Checkbox"},
  LogisticShare: {title: "Logistic Share"},
  NextDestination: {filterType: "String", title: "Next Destination", cellType: "String"},
  OrderCost: {title: "Order Cost"},
  OrderStatus: {filterType: "StatusDropdown", title: "Order Status", cellType: "Status"},
  PackageHeight: {title: "Package Height"},
  PackageLength: {title: "Package Length"},
  PackageWeight: {title: "Package Weight"},
  PackageWidth: {title: "Package Width"},
  PickupAddress: {filterType: "String", title: "Pickup Address", cellType: "String"},
  PickupCity: {filterType: "String", title: "City", cellType: "String"},
  PickupState: {filterType: "String", title: "State", cellType: "String"},
  PickupTime: {title: "Pickup Time", cellType: "String"},
  PickupType: {title: "Pickup Type"},
  RouteStatus: {filterType: "StatusDropdown", title: "Route Status", cellType: "String"},
  TotalValue: {title: "Total Value"},
  UseExtraHelper: {title: "Use Extra Helper"},
  User: {title: "User"},
  UserOrderNumber: {filterType: "String", title: "AWB", cellType: "Link"},
  VAT: {title: "VAT"},
  WebOrderID: {filterType: "String", title: "Web Order ID", cellType: "String"},
  WebstoreName: {filterType: "String", title: "Webstore Name", cellType: "String"},
  ZipCode: {filterType: "String", title: "Zip Code", cellType: "String"},
}

export const pickupOrdersColumns = ["IsChecked", "ID", "WebstoreName", "PickupTime", "PickupAddress", "PickupCity", "PickupState", "OrderStatus"];

export const receivedOrdersColumns = ["IsChecked", "ID", "WebstoreName", "PickupTime", "DropoffAddress", "RouteStatus", "ZipCode"];

export const orderDetails = ["UserOrderNumber", "WebOrderID", "User", "PickupType", "RouteStatus", "PickupTime", "PickupAddress", "DropoffTime", "DropoffAddress", "PackageWeight", "PackageLength", "PackageWidth", "PackageHeight", "OrderCost", "FinalCost", "VAT", "IncludeInsurance", "TotalValue", "UseExtraHelper", "EtobeeShare", "DriverShare", "LogisticShare"];
