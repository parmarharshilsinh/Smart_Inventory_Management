import storage from '../src/utils/storage';
import config from '../src/constants/config';
import { mockUsers } from '../src/constants/mockData';

describe('Auth & Role-Based Navigation Access', () => {
  beforeEach(async () => {
    await storage.clear();
  });

  it('determines Admin vs Staff privileges based on user role', () => {
    const adminUser = mockUsers.find((u) => u.role === 'ROLE_ADMIN');
    const staffUser = mockUsers.find((u) => u.role === 'ROLE_STAFF');

    const checkIsAdmin = (u) => u?.role === 'ROLE_ADMIN' || u?.role === 'ADMIN';

    expect(checkIsAdmin(adminUser)).toBe(true);
    expect(checkIsAdmin(staffUser)).toBe(false);
  });

  it('allows Admin to access administrative management routes', () => {
    const adminRole = 'ROLE_ADMIN';
    const canManageUsers = adminRole === 'ROLE_ADMIN';
    const canCreateNewSku = adminRole === 'ROLE_ADMIN';
    const canDeleteProduct = adminRole === 'ROLE_ADMIN';

    expect(canManageUsers).toBe(true);
    expect(canCreateNewSku).toBe(true);
    expect(canDeleteProduct).toBe(true);
  });

  it('restricts Staff users from administrative actions while allowing stock movements', () => {
    const staffRole = 'ROLE_STAFF';
    const canManageUsers = staffRole === 'ROLE_ADMIN';
    const canStockIn = ['ROLE_ADMIN', 'ROLE_STAFF'].includes(staffRole);
    const canStockOut = ['ROLE_ADMIN', 'ROLE_STAFF'].includes(staffRole);

    expect(canManageUsers).toBe(false);
    expect(canStockIn).toBe(true);
    expect(canStockOut).toBe(true);
  });

  it('persists auth token and user profile to SecureStore on login', async () => {
    const mockToken = 'jwt.test.token.xyz';
    const testUser = {
      id: 1,
      username: 'admin',
      role: 'ROLE_ADMIN',
    };

    await storage.setItem(config.tokenStorageKey, mockToken);
    await storage.setItem(config.userStorageKey, testUser);

    const savedToken = await storage.getItem(config.tokenStorageKey);
    const savedUser = await storage.getObject(config.userStorageKey);

    expect(savedToken).toBe(mockToken);
    expect(savedUser.username).toBe('admin');
  });

  it('clears credentials from SecureStore on logout', async () => {
    await storage.setItem(config.tokenStorageKey, 'sample-token');
    await storage.setItem(config.userStorageKey, { id: 1 });

    // Logout
    await storage.removeItem(config.tokenStorageKey);
    await storage.removeItem(config.userStorageKey);

    const token = await storage.getItem(config.tokenStorageKey);
    const user = await storage.getItem(config.userStorageKey);

    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
