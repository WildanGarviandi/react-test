export const conf = {
  ID: { filterType: 'String', title: 'AWB / Web Order ID', cellType: 'IDLink' },
  Deadline: { filterType: 'DateTime', title: 'Deadline', cellType: 'Datetime' },
  WebstoreName: { filterType: 'String', title: 'Webstore Name', cellType: 'String' },
};

export const inboundOrdersColumns = ['ID', 'WebstoreName', 'Deadline'];
