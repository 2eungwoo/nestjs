import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entities/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { Transform, Type } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { MovieUserLike } from './movie-user-likes.entity';

/**
 * ManyToMany : Director <-> Movie 감독은 여러 영화를 만들 수 있음
 * OneToOne : MovieDetial <-> Movie 영화는 하나의 상세 내용을 가질 수 있음
 * ManyToMany : Genre <-> Movie 영화는 여러개의 장르를 가질 수 있고 장르는 여러개의 영화에 속할 수 있음
 */

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.createdMovies,)
  creator: User;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
  })
  @JoinColumn()
  movieDetail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  director: Director;

  @Column({
    default: 0,
  })
  likesCount: number;

  @Column()
  @Transform(({ value }) => `http://localhost:3000/${value}`)
  fileName: string;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: MovieUserLike[]

}
