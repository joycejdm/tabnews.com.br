import { fetchUser } from '/home/joyce/unb/testes/tabnews.com.br/pages/interface/hooks/useUser/index.js';

import { vi } from 'vitest';

describe('fetchUser', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // CT1 - response.status = 401, responseBody.blocked = false
  it('should clear user state and remove from localStorage quando status é 401 e não bloqueado', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ blocked: false }),
      }),
    );

    const setUser = vi.fn();
    const setError = vi.fn();
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');

    await fetchUser(setUser, setError);

    expect(removeItem).toHaveBeenCalledWith('user');
    expect(setUser).toHaveBeenCalledWith(null);
  });

  // CT2 - response.status = 401, responseBody.blocked = true
  it('should throw an error quando status é 401 e bloqueado', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ blocked: true }),
      }),
    );

    const setUser = vi.fn();
    const setError = vi.fn();

    await expect(fetchUser(setUser, setError)).rejects.toThrow('User is blocked.');
  });

  // CT3 - response.status = 500, responseBody.blocked = false
  it('should throw an error quando status é 500 e não bloqueado', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 500,
        json: () => Promise.resolve({ blocked: false }),
      }),
    );

    const setUser = vi.fn();
    const setError = vi.fn();

    await expect(fetchUser(setUser, setError)).rejects.toThrow('Server error, not blocked.');
  });

  // CT4 - response.status = 500, responseBody.blocked = true
  it('should throw an error quando status é 500 e bloqueado', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 500,
        json: () => Promise.resolve({ blocked: true }),
      }),
    );

    const setUser = vi.fn();
    const setError = vi.fn();

    await expect(fetchUser(setUser, setError)).rejects.toThrow('Server error, user is blocked.');
  });
});
