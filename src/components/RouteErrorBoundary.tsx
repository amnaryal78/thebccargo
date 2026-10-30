import React from 'react';
import { ErrorState } from '../design/primitives/Feedback';

/** A route chunk that fails on a bad connection (or after a deploy) would otherwise blank the whole site. */
export class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Page failed to load', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto px-4 py-12">
        <ErrorState
          title="This page did not load"
          description="Check your connection, then reload the page."
          actionLabel="Reload page"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }
}
