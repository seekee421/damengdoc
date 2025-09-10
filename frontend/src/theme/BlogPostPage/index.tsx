import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import DocFeedback from '../../components/Feedback/DocFeedback';

export default function BlogPostPageWrapper(props: any): React.ReactElement {
  return (
    <>
      <BlogPostPage {...props} />
      <DocFeedback />
    </>
  );
}