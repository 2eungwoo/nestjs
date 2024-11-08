import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    return await this.directorRepository.save(createDirectorDto);
  }

  async findAll() {
    return await this.directorRepository.find();
  }

  async findOne(id: number) {
    return await this.directorRepository.findOne({
      where: {
        id,
      },
      relations: ['movies'],
    });
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const targetDirector = await this.directorRepository.findOne({
      where: {
        id,
      },
      relations: ['movies'],
    });

    if (!targetDirector) {
      throw new NotFoundException('찾을 수 없음');
    }

    await this.directorRepository.update({ id }, { ...updateDirectorDto });

    const updatedDirector = await this.directorRepository.findOne({
      where: {
        id,
      },
      relations: ['movies'],
    });

    return updatedDirector;
  }

  async remove(id: number) {
    await this.directorRepository.delete(id);
  }
}
