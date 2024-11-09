import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { In, Like, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,

    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,

    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async getManyMovies(title?: string) {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return await qb.getManyAndCount();
    // if (!title) {
    //   return await this.movieRepository.find({
    //     relations: ['movieDetail', 'genres'],
    //   });
    // }

    // return await this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`),
    //   },
    //   relations: ['movieDetail', 'genres'],
    // });
  }

  async getMovieId(id: number) {
    const movie = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.movieDetail', 'detail')
      .where('movie.id =:id', { id: id })
      .getOne();

    return movie;
    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
    //   },
    //   relations: ['movieDetail', 'genres'], // 같이 가져오고싶은 거 여기다가 써주면 전부 됨
    // });

    // if (!movie) {
    //   throw new NotFoundException('존재하지 않는 영화입니다.');
    // }

    // return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 감독 ID');
    }

    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      movieDetail: {
        detail: createMovieDto.movieDetail,
      },
      director: director,
      genres: genres,
    });

    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const targetMovie = await this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
      relations: ['movieDetail', 'genres'],
    });

    if (!targetMovie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    const { detail, genreIds, directorId, ...movieRest } = updateMovieDto;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId,
        },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 감독 ID');
      }
    }

    const genres = await this.genreRepository.find({
      where: {
        id: In(genreIds),
      },
    });

    this.movieRepository.update({ id }, updateMovieDto);

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
