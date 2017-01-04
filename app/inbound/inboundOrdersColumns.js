export const conf = {
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink"},
  PickupTime: {filterType: "DateTime", title: "Pickup Time", cellType: "Datetime"},
  WebstoreName: {filterType: "String", title: "Webstore Name", cellType: "String"}
}

export const inboundOrdersColumns = ["ID", "WebstoreName", "PickupTime"];