import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { Exclude } from 'class-transformer';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude({
    // toClassOnly: true -> 요청을 받을 때 안받겠다는 뜻
    toPlainOnly: true, // 응답을 낼 때 안보여주겠다는 뜻
  })
  password: string;

  @Column({
    enum: Role,
    default: Role.user, // default : normal user
  })
  role: Role;
}
