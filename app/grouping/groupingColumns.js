export const conf = {
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink"},
  PickupAddress: {filterType: "String", title: "Pickup Address", cellType: "String"},
  PickupCity: {filterType: "String", title: "City", cellType: "String"},
  WebstoreName: {filterType: "String", title: "Webstore Name", cellType: "String"},
  Weight: {filterType: "String", title: "Weight", cellType: "String"},
  ZipCode: {filterType: "String", title: "Zip Code", cellType: "String"}
}

export const groupingColumns = ["ID", "WebstoreName", "Weight", "PickupAddress", "PickupCity", "ZipCode"];