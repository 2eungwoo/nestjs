import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreatedDataDto } from './dto/create-data.dto';
import { UpdateDataDto } from './dto/update-data.dto';

interface Dummy {
  id: number;
  data: string;
}

@Controller()
export class AppController {
  private data: Dummy[] = [
    {
      id: 1,
      data: 'one',
    },
    {
      id: 2,
      data: 'two',
    },
    {
      id: 3,
      data: 'three',
    },
  ];

  constructor(private readonly appService: AppService) {}

  @Get('/hello-nest')
  getHello(): string {
    // return this.appService.getHello();
    return 'hello-nest';
  }

  @Get('/data/all')
  getData() {
    return this.data;
  }

  @Get('data/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  getDataById(@Param('id') id: string) {
    const data = this.data.find((d) => d.id === +id);

    if (!data) {
      throw new NotFoundException('Data not found'); // Corrected error message for clarity
    }

    return data;
  }

  @Post('/data')
  postData(@Body() bodydto: CreatedDataDto) {
    const newData: Dummy = {
      id: bodydto.id,
      data: bodydto.datastringyes,
    };

    this.data.push(newData);

    return this.data;
  }

  @Patch('/data/:id')
  patchData(@Param('id') id: number, @Body() updateBody: UpdateDataDto) {
    const targetData = this.data.find((d) => d.id === +id);

    if (!targetData) {
      throw new NotFoundException('not exist data');
    }

    Object.assign(targetData, updateBody);

    return targetData;
  }

  @Get('/querytest')
  getDatas(@Query('idnumber') id?: string, @Query('datastring') data?: string) {
    if (!id) {
      return 'id값 전달 안됐음';
    }

    return 'query parameter 써보기' + id + data;
  }
}
