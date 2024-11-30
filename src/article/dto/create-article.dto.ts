import { IsNotEmpty, IsString } from "class-validator";
import { PagePaginationDto } from "src/common/dto/page-pagination.dto";

export class CreateArticleDto extends PagePaginationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
