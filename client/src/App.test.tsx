import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading or auth screen', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Загрузка сессии/i);
  expect(loadingElement).toBeInTheDocument();
});