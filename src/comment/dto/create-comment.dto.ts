import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @Type(() => Number)
    @IsNotEmpty()
    articleId: number;
}
