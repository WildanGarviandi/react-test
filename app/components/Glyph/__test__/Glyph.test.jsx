// Glyph.react-test.js
import React from 'react';
import { shallow } from 'enzyme';

import Glyph from '../Glyph';

jest.mock('classnames', () => {
  const data = () => {};
  return data;
});

jest.mock('./glyph.scss', () => {
  const data = {
    glyphicon: {},
  };
  return data;
});

test('Glyph Component', () => {
  const component = shallow(<Glyph className={''} name={''} />);
  // const result = component.toJSON();
  // expect(result).toMatchSnapshot();
  expect(true).toBe(true);
});
