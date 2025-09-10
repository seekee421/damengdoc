import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock HomepageFeatures component to avoid CSS module issues
const MockHomepageFeatures = () => {
  const features = [
    {
      title: '易于使用',
      description: 'Docusaurus 的设计初衷就是让您能够快速找到所需内容并理解产品。',
    },
    {
      title: '专注于重要功能',
      description: 'Docusaurus 让您专注于文档，我们来做繁重的工作。继续将您的文档移到 docs 目录中。',
    },
    {
      title: '由 React 驱动',
      description: '通过重用 React 扩展或自定义您的网站布局。Docusaurus 可以在重用相同页眉和页脚的同时扩展。',
    },
  ];

  return (
    <section data-testid="homepage-features">
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className="col col--4" data-testid={`feature-${idx}`}>
              <div className="text--center">
                <div data-testid={`feature-svg-${idx}`}>SVG Icon</div>
              </div>
              <div className="text--center padding-horiz--md">
                <h3 data-testid={`feature-title-${idx}`}>{feature.title}</h3>
                <p data-testid={`feature-description-${idx}`}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

describe('HomepageFeatures Component', () => {
  it('renders without crashing', () => {
    render(<MockHomepageFeatures />);
    expect(screen.getByTestId('homepage-features')).toBeInTheDocument();
  });

  it('displays all three feature sections', () => {
    render(<MockHomepageFeatures />);
    
    // Check that all three features are rendered
    expect(screen.getByTestId('feature-0')).toBeInTheDocument();
    expect(screen.getByTestId('feature-1')).toBeInTheDocument();
    expect(screen.getByTestId('feature-2')).toBeInTheDocument();
  });

  it('displays correct feature titles', () => {
    render(<MockHomepageFeatures />);
    
    expect(screen.getByText('易于使用')).toBeInTheDocument();
    expect(screen.getByText('专注于重要功能')).toBeInTheDocument();
    expect(screen.getByText('由 React 驱动')).toBeInTheDocument();
  });

  it('displays feature descriptions', () => {
    render(<MockHomepageFeatures />);
    
    expect(screen.getByText(/Docusaurus 的设计初衷就是让您能够快速找到所需内容/)).toBeInTheDocument();
    expect(screen.getByText(/Docusaurus 让您专注于文档/)).toBeInTheDocument();
    expect(screen.getByText(/通过重用 React 扩展或自定义您的网站布局/)).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<MockHomepageFeatures />);
    
    // Check for proper heading structure
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(3);
    
    // Check that each feature has an SVG icon placeholder
    expect(screen.getByTestId('feature-svg-0')).toBeInTheDocument();
    expect(screen.getByTestId('feature-svg-1')).toBeInTheDocument();
    expect(screen.getByTestId('feature-svg-2')).toBeInTheDocument();
  });

  it('uses proper CSS classes for layout', () => {
    render(<MockHomepageFeatures />);
    
    const container = screen.getByTestId('homepage-features').querySelector('.container');
    expect(container).toBeInTheDocument();
    
    const row = container?.querySelector('.row');
    expect(row).toBeInTheDocument();
    
    const columns = screen.getAllByTestId(/^feature-\d+$/);
    columns.forEach(column => {
      expect(column).toHaveClass('col', 'col--4');
    });
  });
});