import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing title', () => {
  render(<App />);
  expect(screen.getByText(/Elige tu Actividad/i)).toBeInTheDocument();
});
