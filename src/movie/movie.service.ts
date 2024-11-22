import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { DataSource, In, Like, Repository, Transaction } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/Common.service';

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

    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) {}

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
  }

  async findAllWithPagination(dto: GetMoviesDto) {
    const { title, take, page } = dto;

    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    // optional이니까 존재여부 체크해서 있을 경우 적용
    // if (take && page) {
    //   qb.take(take);
    //   qb.skip((page - 1) * take);
    // }
    if (take && page) {
      this.commonService.applyPagePaginationParamsToQb(qb, dto);
    }

    // optional이니까 존재여부 체크해서 있을 경우 적용
    if (title) {
      qb.where('movie.title LIKE :title', {
        title: `%${title}%`,
      });
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
    // query runner
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); // qr을 db에 연결
    await qr.startTransaction(); // transaction 실행. 괄호 안에 isolation level 옵션

    // 반드시 try-catch-finally 사용
    try {
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

      const movie = await qr.manager.save(Movie, {
        title: createMovieDto.title,
        movieDetail: {
          detail: createMovieDto.movieDetail,
        },
        director: director,
        genres: genres,
      });

      await qr.commitTransaction(); // transaction commit

      return movie; // commit 후에 return
    } catch (e) {
      // 에러처리 후 롤백
      await qr.rollbackTransaction(); // transaction rollback
      throw e;
    } finally {
      await qr.release(); // 커밋했든 롤백했든 db pool에 다시 transaction을 되돌려줘야함(release)
    }
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
