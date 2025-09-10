import React from 'react';
import NavbarDropdownItem from '../../components/NavbarDropdownItem';

const ComponentTypes = {
  'custom-dropdown-item': (props) => {
    return <NavbarDropdownItem {...props} />;
  },
};

export default ComponentTypes;