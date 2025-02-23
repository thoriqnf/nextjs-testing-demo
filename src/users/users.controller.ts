import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('users/index')
  async findAll() {
    const users = await this.usersService.findAll();
    return { users };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.usersService.create(createUserDto);

    if (res.req.headers['hx-request']) {
      // Clear the form by triggering a reset event
      res.setHeader('HX-Trigger', 'clearForm');
      return res.render('users/user-item', { user, layout: false });
    }

    return res.json(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findOne(id);

    if (res.req.headers['hx-request']) {
      return res.render('users/user-item', { user, layout: false });
    }

    return res.json(user);
  }

  @Get(':id/edit')
  async edit(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findOne(id);
    return res.render('users/edit', { user, layout: false });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const user = await this.usersService.update(id, updateUserDto);

    if (res.req.headers['hx-request']) {
      return res.render('users/user-item', { user, layout: false });
    }

    return res.json(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.usersService.remove(id);

    if (res.req.headers['hx-request']) {
      res.setHeader('HX-Trigger', 'userDeleted');
      return res.send('');
    }

    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
