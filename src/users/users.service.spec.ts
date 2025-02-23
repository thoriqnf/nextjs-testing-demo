import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User, UserRole } from './interfaces/user.interface';

describe('UsersService', () => {
  let service: UsersService;

  // Mock user data for testing
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create a testing module with UsersService
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    // Get the service instance
    service = module.get<UsersService>(UsersService);
  });

  // Basic service instantiation test
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an empty array when no users exist', () => {
      // Test the initial state of the service
      const users = service.findAll();
      expect(users).toEqual([]);
    });

    it('should return all users', () => {
      // First create a user
      service['users'].set(mockUser.id, mockUser);

      // Then test findAll
      const users = service.findAll();
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user if it exists', () => {
      // First create a user
      service['users'].set(mockUser.id, mockUser);

      // Then test findOne
      const user = service.findOne(mockUser.id);
      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if user does not exist', () => {
      // Test with a non-existent ID
      expect(() => service.findOne('999')).toThrow();
    });
  });
});
