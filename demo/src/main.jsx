import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.scss';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <App />,
);
