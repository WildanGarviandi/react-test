// Glyph.react-test.js
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Glyph from '../Glyph';

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
    const component = renderer.create(<Glyph className={''} name={''} />);
    const result = component.toJSON();
    expect(result).toMatchSnapshot();
  });

  test('should have undefined classNames props', () => {
    const glyph = shallow(<Glyph className={''} name={''} />);
    expect(glyph.props().className).toBeUndefined();
  });
});
