import { render, screen } from '@testing-library/react';
import App from './App';
import { api } from './services/api';

jest.mock('./services/api', () => ({
  api: {
    getCategories: jest.fn(),
    getStores: jest.fn(),
    getUsers: jest.fn(),
    getSearchLogs: jest.fn(),
    createSearchLog: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
}));

beforeEach(() => {
  api.getCategories.mockResolvedValue([]);
  api.getStores.mockResolvedValue([]);
  api.getUsers.mockResolvedValue([]);
  api.getSearchLogs.mockResolvedValue([]);
  api.createSearchLog.mockResolvedValue({});
  api.login.mockResolvedValue({ user: { id: 1, name: 'Test User', email: 'test@example.com' }, token: 'fake-token' });
  api.register.mockResolvedValue({ id: 2, name: 'New User', email: 'new@example.com' });
});

test('renders app shell and discovery panel', async () => {
  render(<App />);

  expect(await screen.findByText(/BazaarHub/i)).toBeInTheDocument();
  expect(await screen.findByText(/Find nearby stores, compare prices, decide faster./i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
});
