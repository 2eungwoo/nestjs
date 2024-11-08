import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';

/**
 * ManyToMany : Director <-> Movie 감독은 여러 영화를 만들 수 있음
 * OneToOne : MovieDetial <-> Movie 영화는 하나의 상세 내용을 가질 수 있음
 * ManyToMany : Genre <-> Movie 영화는 여러개의 장르를 가질 수 있고 장르는 여러개의 영화에 속할 수 있음
 */

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
  })
  @JoinColumn()
  movieDetail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id)
  @JoinColumn()
  director: Director;
}
