import { BadRequestException, Injectable } from '@nestjs/common';
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

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginatioDto,
  ) {
    //    let { cursor, order, take } = dto;
    const { cursor, take } = dto;
    let { order } = dto;
    console.log(`cursor : ${cursor}, take: ${take}`);
    console.log(`order : ${order}`);

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');

      /**
         {
           values: {
               id: 25
           },
           order: ['id_DESC']
         }
        */
      const cursorObj = JSON.parse(decodedCursor);
      order = cursorObj.order;
      const { values } = cursorObj;

      const columns = Object.keys(values);

      const comparisonOperator = order.some((o) => o.endsWith('DESC')) // 모두 DESC이라고 가정
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `${c}`).join(',');

      // where 절 : (id, likesCount, createAt) < (:value, :value, :value) 만들기
      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    // order : ex) [likesCount_ASC, likesCount_DESC]
    for (let i = 0; i < order.length; i++) {
      const [columName, orderDirection] = order[i].split('_');

      if (orderDirection !== 'ASC' && orderDirection !== 'DESC') {
        throw new BadRequestException(
          'order direction은 asc 또는 desc 이어야 합니다.',
        );
      }

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${columName}`, orderDirection);
      } else {
        qb.addOrderBy(`${qb.alias}.${columName}`, orderDirection);
      }
    }

    qb.take(take);
    const results = await qb.getMany();
    const nextCursor = this.generateNextCursor(results, order);
    return { nextCursor };
  }

  // 쿼리 실행 후 응답받은 데이터를 파라미터로 넣을 것이다. 왜?
  // 마지막 기준으로 계속 페이징 할거기 때문에, $ㅖ마지막 데이터} 관련해서 알려면 정보를 알아야함
  public generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null; // 응답받은 데이터가 없다면 다음 데이터가 없는 것이므로 커서를 만들 필요가 없음

    // 커서 만들자. 다음과 같은 형태로 만들어보자. 그리고 이걸 base64로 인코딩해서 string한줄로 반환할거임
    /**
         {
           values: {
               id: 25
           },
           order: ['id_DESC']
         }
    */

    const lastItem = results[results.length - 1];
    const values = {};

    order.forEach((columOrder) => {
      const [column] = columOrder.split('_'); // 정렬방향(asc,desc)은 안쓸거라 column name만 추출
      console.log(`${column}, ${[column]}`);
      values[column] = lastItem[column];
    });

    const cursorObj = { values, order };
    // base64로 인코딩해서 보내기 -> 프론트엔드에서도 이 스트링 자체를 관리할 수 있고 나중에 서버로 보낼때도 그대로 보내주면 됨
    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );
    return nextCursor;
  }
}
