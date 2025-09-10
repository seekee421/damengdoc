import React from 'react';
import DocPage from '@theme-original/DocPage';
import DocFeedback from '../../components/Feedback/DocFeedback';

export default function DocPageWrapper(props: any): React.ReactElement {
  return (
    <>
      <DocPage {...props} />
      <DocFeedback />
    </>
  );
}