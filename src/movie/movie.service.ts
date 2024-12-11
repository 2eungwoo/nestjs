import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import {
  DataSource,
  In,
  Like,
  QueryRunner,
  Repository,
  Transaction,
} from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesPageDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/Common.service';
import { join } from 'path';
import { User } from 'src/users/entities/user.entity';
import { MovieUserLike } from './entities/movie-user-likes.entity';

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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,

    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) { }

  async findAll(title?: string) {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    const [result, total] = await qb.getManyAndCount();
    return { result, total };
  }

  async findAllWithPagination(dto: GetMoviesPageDto) {
    const { title } = dto;

    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    // optional이니까 존재여부 체크해서 있을 경우 적용
    if (title) {
      qb.where('movie.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const [data, count] = await qb.getManyAndCount();
    return { data, count, nextCursor };
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

  async createMovie(createMovieDto: CreateMovieDto, userId: number, qr: QueryRunner) {
    const director = await qr.manager.findOne(Director, {
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 감독 ID');
    }

    const genres = await qr.manager.find(Genre, {
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    const filePath = join('public', 'movie');
    const newMovie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        movieDetail: {
          detail: createMovieDto.movieDetail,
        },
        director: director,
        genres: genres,
        creator: {
          id: userId,
        },
        fileName: join(filePath, createMovieDto.fileName),
      })
      .execute();

    return newMovie;
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



  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId
      }
    });

    if (!movie) {
      throw new NotFoundException('movie not found');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const likeRecord = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id =:movieId', { movieId })
      .andWhere('user.id =:userId', { userId })
      .getOne();


    if (likeRecord) {
      if (likeRecord.isLike === isLike) { // 이미 존재하는 상태와 같으면 좋아요든 싫어요든 취소하게 하는 로직(삭제)
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update({
          movie,
          user,
        }, {
          isLike: isLike,
        }
        );
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike
      });
    }

    const result = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id =:movieId', { movieId })
      .andWhere('user.id =:userId', { userId })
      .getOne();


    return {
      isLike: result && result.isLike
    }
  }
}
