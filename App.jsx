import React from 'react';
import ReactDOM from 'react-dom';
import GreyHillWidget from './GreyHillWidget';

// This is the entry point for the embed widget
function App() {
  return (
    <React.StrictMode>
      <GreyHillWidget />
    </React.StrictMode>
  );
}

ReactDOM.render(<App />, document.getElementById('grey-hill-widget'));
