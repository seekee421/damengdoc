const React = require('react');

module.exports = {
  __esModule: true,
  default: function MockHeading({ children, as: Component = 'h1', className, ...props }) {
    return React.createElement(Component, {
      className: className,
      ...props
    }, children);
  }
};