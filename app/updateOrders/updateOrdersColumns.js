export const conf = {
  ID: {filterType: "String", title: "AWB / Web Order ID", cellType: "IDLink"},
  PackageHeight: {title: "Package Height", cellType: "String"},
  PackageLength: {title: "Package Length", cellType: "String"},
  PackageWeight: {title: "Package Weight", cellType: "String"},
  PackageWidth: {title: "Package Width", cellType: "String"},
  Deadline: {filterType: "DateTime", title: "Deadline", cellType: "Datetime"},
}

export const updateOrdersColumns = ["ID", "PackageLength", "PackageWidth", "PackageHeight", "PackageWeight", "Deadline"];