const React = require('react');

module.exports = {
  __esModule: true,
  default: function MockLayout({ children, title, description, ...props }) {
    return React.createElement('div', {
      'data-testid': 'layout',
      'data-title': title,
      'data-description': description,
      ...props
    }, children);
  }
};