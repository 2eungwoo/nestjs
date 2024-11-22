import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginatioDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;
    const skip = (page - 1) * take;
    if (take && page) {
      qb.take(take);
      qb.skip(skip);
    }
  }

  applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginatioDto,
  ) {
    const { id, order, take } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';
      qb.where(`${qb.alias}.id ${direction} :id`, { id });
      // 쿼리가 다음과 같이 날아감
      // order -> ACS, where movie.id > :id
      // order -> DESC, where movie.id < :id
    }
    qb.orderBy(`${qb.alias}.id, order`);
    // order by movie.id asc 또는 order by movie.id desc

    qb.take(take);
    // limit {take}
  }
}
