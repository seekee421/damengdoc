const React = require('react');

module.exports = {
  __esModule: true,
  default: function MockLink({ children, to, className, ...props }) {
    return React.createElement('a', {
      href: to,
      className: className,
      ...props
    }, children);
  }
};