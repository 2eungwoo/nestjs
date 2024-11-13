import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    return await this.genreRepository.save(createGenreDto);
  }

  async findAll() {
    return await this.genreRepository.find();
  }

  async findOne(id: number) {
    return await this.genreRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!genre) {
      throw new NotFoundException('없는 장르');
    }

    // 업데이트
    await this.genreRepository.update(
      {
        id: id,
      },
      updateGenreDto,
    );

    // 업데이트한거 다시 찾고 반환
    const updatedGenre = this.genreRepository.findOne({
      where: {
        id: id,
      },
    });

    return updatedGenre;
  }

  async remove(id: number) {
    const target = await this.genreRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!target) {
      throw new NotFoundException('없는 대상');
    }

    await this.genreRepository.delete(id);
    return target;
  }
}
