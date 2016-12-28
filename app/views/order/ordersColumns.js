import lodash from 'lodash';

export const conf = {
  Actions: {title: "Actions", cellType: "Actions"},
  DriverShare: {title: "Driver Share"},
  DropoffAddress: {filterType: "String", title: "Dropoff Address", cellType: "String"},
  DropoffCity: {filterType: "String", title: "City", cellType: "String"},
  DropoffState: {filterType: "String", title: "State", cellType: "String"},
  DropoffTime: {title: "Dropoff Time"},
  DueTime: {title: "Deadline", cellType: "Datetime"},
  EtobeeShare: {title: "Etobee Share"},
  FinalCost: {title: "Final Cost"},
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink"},
  IncludeInsurance: {title: "Include Insurance"},
  IsChecked: {headerType: "Checkbox", cellType: "Checkbox"},
  LogisticShare: {title: "Logistic Share"},
  NextDestination: {filterType: "String", title: "Suggested Destination", cellType: "String"},
  OrderCost: {title: "Order Cost"},
  DeliveryFee: {title: "Delivery Fee"},
  OrderStatus: {filterType: "StatusDropdown", title: "Order Status", cellType: "Status"},
  PackageHeight: {title: "Package Height", cellType: "String"},
  PackageLength: {title: "Package Length", cellType: "String"},
  PackageWeight: {title: "Package Weight", cellType: "String"},
  PackageWidth: {title: "Package Width", cellType: "String"},
  PickupAddress: {filterType: "String", title: "Pickup Address", cellType: "String"},
  PickupCity: {filterType: "String", title: "City", cellType: "String"},
  PickupState: {filterType: "String", title: "State", cellType: "String"},
  PickupTime: {filterType: "DateTime", title: "Pickup Time", cellType: "Datetime"},
  PickupType: {title: "Pickup Type"},
  RouteStatus: {filterType: "StatusDropdown", title: "Route Status", cellType: "String"},
  TotalValue: {title: "Total Value"},
  UseExtraHelper: {title: "Use Extra Helper"},
  User: {title: "User"},
  UserOrderNumber: {filterType: "String", title: "AWB", cellType: "Link"},
  VAT: {title: "VAT"},
  WebOrderID: {filterType: "String", title: "Web Order ID", cellType: "String"},
  WebstoreName: {filterType: "String", title: "Webstore Name", cellType: "String"},
  Weight: {filterType: "String", title: "Weight", cellType: "String"},
  ZipCode: {filterType: "String", title: "Zip Code", cellType: "String"},
  IsCOD: {title: "COD Order"},
  SuggestedVendors: {title: "Suggested Vendors", cellType: "Array", filterType: "String"},
}

export const pickupOrdersColumns = ["IsChecked", "ID", "WebstoreName", "Weight", "PickupAddress", "PickupCity", "ZipCode", "PickupTime", "OrderStatus"];
export const receivedOrdersColumns = ["IsChecked", "ID", "WebstoreName", "DropoffAddress", "DropoffCity", "DropoffState", "ZipCode", "DueTime", "NextDestination", "SuggestedVendors"];
export const updateOrdersColumns = ["ID", "PackageLength", "PackageWidth", "PackageHeight", "PackageWeight", "PickupTime"];

export const orderDetailsSummary = ["UserOrderNumber", "WebOrderID", "User", "PickupType", "RouteStatus", "PickupTime", "PickupAddress", "DropoffTime", "DropoffAddress", "DueTime", "NextDestination"];
export const orderDetailsCost = ["PackageWeight", "PackageLength", "PackageWidth", "PackageHeight", "TotalValue", "IsCOD"];
export const orderDetailsPricing = ["DeliveryFee", "FinalCost", "VAT", "IncludeInsurance", "UseExtraHelper", "EtobeeShare", "DriverShare", "LogisticShare"];
