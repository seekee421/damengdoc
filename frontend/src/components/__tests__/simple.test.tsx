import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const SimpleComponent = () => {
  return <div>Hello Test</div>;
};

describe('Simple Test', () => {
  it('renders a simple component', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('performs basic math', () => {
    expect(2 + 2).toBe(4);
  });
});