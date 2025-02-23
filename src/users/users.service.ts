import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  create(createUserDto: CreateUserDto): User {
    const id = uuidv4();
    const now = new Date();

    const user: User = {
      id,
      ...createUserDto,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findOne(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const existingUser = this.findOne(id);

    const updatedUser: User = {
      ...existingUser,
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  remove(id: string): void {
    if (!this.users.has(id)) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.users.delete(id);
  }
}
