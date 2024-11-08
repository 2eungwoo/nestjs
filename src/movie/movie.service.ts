import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDetail } from './entities/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  async getManyMovies(title?: string) {
    if (!title) {
      return await this.movieRepository.find({
        relations: ['movieDetail'],
      });
    }

    return await this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['movieDetail'],
    });
  }

  async getMovieId(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
      relations: ['movieDetail'], // 같이 가져오고싶은 거 여기다가 써주면 전부 됨
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      movieDetail: {
        detail: createMovieDto.movieDetail,
      },
    });

    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const targetMovie = await this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
      relations: ['movieDetail'],
    });

    if (!targetMovie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    const { detail, ...movieRest } = updateMovieDto;

    this.movieRepository.update({ id }, movieRest);

    if (detail) {
      await this.movieDetailRepository.update(
        {
          id: (await targetMovie).movieDetail.id,
        },
        {
          detail,
        },
      );
    }

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['movieDetail'],
    });

    return newMovie;
  }

  async deleteMovie(id: number) {
    const targetMovie = await this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
      relations: ['movieDetail'],
    });

    if (!targetMovie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(targetMovie.movieDetail.id);
    return id;
  }
}
