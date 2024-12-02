import { Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class MovieUserLike {

    // @PrimaryGeneratedColumn()
    // id: number;

    @PrimaryColumn({
        name: 'movieId',
        type: 'int8',
    })
    @ManyToOne(() => Movie)
    movie: Movie

    @PrimaryColumn({
        name: 'userId',
        type: 'int8',
    })
    @ManyToOne(() => User)
    user: User
}