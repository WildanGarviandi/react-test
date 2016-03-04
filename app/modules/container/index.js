import React from 'react';
import {ButtonAtRightTop, PageTitle, Tables} from '../base';

const header = {
  id: 'ID', hub: 'HUB ID'
}

const items = [
  { id: 'A112', hub: 'Hub WTF'},
  { id: 'C237', hub: 'Hub FTW'}
];

const ContainerTable = Tables(['id', 'hub'], {}, {});

const ContainerPage = React.createClass({
  render() {
    return (
      <div>
        <ButtonAtRightTop val={'Create Container'} />
        <PageTitle title={'Container List'} />
        <ContainerTable data={items} header={header} />
      </div>
    );
  }
});

export default ContainerPage
