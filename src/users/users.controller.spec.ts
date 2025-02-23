import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './interfaces/user.interface';
import { Response } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
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

  // Mock response object for testing
  const mockResponse = {
    render: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    req: {
      headers: {},
    },
  } as unknown as Response;

  beforeEach(async () => {
    // Create a testing module with controller and service
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    // Get the controller and service instances
    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  // Basic controller instantiation test
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users array with render data', async () => {
      // Test the findAll method which returns data for view rendering
      const result = await controller.findAll();

      // Verify service was called
      expect(service.findAll).toHaveBeenCalled();

      // Verify the returned data structure
      expect(result).toEqual({
        users: [mockUser],
      });
    });
  });

  describe('findOne', () => {
    it('should return a user as JSON for API request', async () => {
      // Mock a regular API request
      const response = {
        ...mockResponse,
        req: { headers: {} },
      } as unknown as Response;

      // Test findOne method
      await controller.findOne('1', response);

      // Verify service was called with correct ID
      expect(service.findOne).toHaveBeenCalledWith('1');

      // Verify JSON response was called with user data
      expect(response.json).toHaveBeenCalledWith(mockUser);
    });

    it('should render user partial for HTMX request', async () => {
      // Mock an HTMX request
      const response = {
        ...mockResponse,
        req: { headers: { 'hx-request': 'true' } },
      } as unknown as Response;

      // Test findOne method with HTMX request
      await controller.findOne('1', response);

      // Verify service was called with correct ID
      expect(service.findOne).toHaveBeenCalledWith('1');

      // Verify render was called with correct template and data
      expect(response.render).toHaveBeenCalledWith('users/user-item', {
        user: mockUser,
        layout: false,
      });
    });
  });
});
