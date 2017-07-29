// Glyph.react-test.js
import React from 'react';
import { shallow } from 'enzyme';
import enzymeSerializer from 'enzyme-to-json/serializer';

import Glyph from '../Glyph';

expect.addSnapshotSerializer(enzymeSerializer);

jest.mock('classnames', () => {
  const data = () => { };
  return data;
});

jest.mock('./glyph.scss', () => {
  const data = {
    glyphicon: {},
  };
  return data;
});

describe('Glph Component', () => {
  test('should have matched snapshot', () => {
    const result = shallow(<Glyph className={''} name={''} />);
    expect(result).toMatchSnapshot();
  });

  test('should have undefined classNames props', () => {
    const glyph = shallow(<Glyph className={''} name={''} />);
    expect(glyph.props().className).toBeUndefined();
  });
});
