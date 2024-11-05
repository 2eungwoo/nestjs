import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) { }

  getManyMovies(title?: string) {
    return this.movieRepository.find();
  }

  getMovieId(id: number) {
    const movie = this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    // await this.movieRepository.save({
    //   title: createMovieDto.title,
    //   genre: createMovieDto.genre,
    // })
    return await this.movieRepository.save(createMovieDto);
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const targetMovie = this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
    });

    if (!targetMovie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    this.movieRepository.update({ id }, updateMovieDto);

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
    });

    return newMovie;
  }

  async deleteMovie(id: number) {
    const targetMovie = this.movieRepository.findOne({
      where: {
        id, // id가 파라미터의 id와 같은 조건(where filter)으로 findOne 하겠다는 뜻
      },
    });

    if (!targetMovie) {
      throw new NotFoundException('존재하지 않는 영화입니다.');
    }

    await this.movieRepository.delete(id);
    return id;
  }

}
