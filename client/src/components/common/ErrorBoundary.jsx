import React, { Component } from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f8fafc' }}>
          <Result
            status="error"
            title="Application Error Encountered"
            subTitle="An unexpected user interface exception occurred. The system remains operational."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Reload Application
              </Button>
            ]}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
