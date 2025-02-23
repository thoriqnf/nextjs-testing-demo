import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/users/interfaces/user.interface';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  // Mock user data for testing
  const mockUser = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    // Create a testing module with the entire application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the application instance
    app = moduleFixture.createNestApplication();

    // Apply the same pipes as in the main application
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return HTML page with users list (HTMX request)', () => {
      // Test the GET /users endpoint with HTMX headers
      return request(app.getHttpServer())
        .get('/users')
        .set('HX-Request', 'true') // Simulate HTMX request
        .expect(200)
        .expect('Content-Type', /html/); // Should return HTML
    });

    it('should return users list as JSON (API request)', async () => {
      // First create a user
      const createdUser = await request(app.getHttpServer())
        .post('/users')
        .send(mockUser);

      // Then test GET /users endpoint
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          // Verify response structure
          expect(Array.isArray(res.body)).toBeTruthy();
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('email');
            expect(res.body[0]).toHaveProperty('username');
          }
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user partial HTML (HTMX request)', async () => {
      // First create a user
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(mockUser);

      const userId = response.body.id;

      // Then test GET /users/:id endpoint with HTMX headers
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('HX-Request', 'true') // Simulate HTMX request
        .expect(200)
        .expect('Content-Type', /html/); // Should return HTML
    });

    it('should return user as JSON (API request)', async () => {
      // First create a user
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(mockUser);

      const userId = response.body.id;

      // Then test GET /users/:id endpoint
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          // Verify response structure
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(mockUser.email);
          expect(res.body.username).toBe(mockUser.username);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).get('/users/999').expect(404);
    });
  });
});
