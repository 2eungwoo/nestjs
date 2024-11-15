import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    console.log(`findOne:user method called`);
    return await user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.userRepository.update({ id: id }, updateUserDto);

    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
  }
}
