import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { MovieService } from './movie.service';
import { NotFoundError } from "rxjs";

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get(':id')
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(e) {
          throw new NotFoundException();
        },
      }),
    )
    id: number,
  ) {
    // return this.movieService.findMovie(id);
    return null;
  }
}
