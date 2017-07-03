import React from 'react';

export default React.createClass({
  render() {
    const {item} = this.props;
    const {BaseParent, BaseChild, CustomChild, Columns} = this.props.components;

    const children = _.map(Columns, (attr) => {
      const Component = (attr in CustomChild ? CustomChild[attr] : BaseChild);
      return <Component key={attr} item={item} attr={attr} />;
    });

    return (<BaseParent item={item}>{children}</BaseParent>);
  }
});
