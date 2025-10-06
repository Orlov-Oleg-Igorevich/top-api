import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TopPageDocument, TopPageModel } from './top-page.model';
import { FindTopPageDto } from './dto/find-top-page.dto';
import { TopPageService } from './top-page.service';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { IdValidationPipes } from '../../src/pipes/id-validation.pipes';
import { NOT_FOUND_TOP_PAGE_EXCEPTION } from './top-page.constans';
import { UnpackedFn } from 'src/utils/unpacked-fn.utils';
import { JwtAuthGuard } from '../../src/auth/guards/jwt.guard';

@Controller('top-page')
export class TopPageController {
  constructor(private readonly topPageService: TopPageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateTopPageDto): Promise<TopPageDocument> {
    return this.topPageService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', IdValidationPipes) id: string): Promise<TopPageDocument> {
    const topPage = await this.topPageService.findById(id);
    if (!topPage) {
      throw new NotFoundException(NOT_FOUND_TOP_PAGE_EXCEPTION);
    }
    return topPage;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdValidationPipes) id: string): Promise<TopPageDocument> {
    const deletedTopPage = await this.topPageService.deleteById(id);
    if (!deletedTopPage) {
      throw new NotFoundException(NOT_FOUND_TOP_PAGE_EXCEPTION);
    }
    return deletedTopPage;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(
    @Param('id', IdValidationPipes) id: string,
    @Body() dto: Partial<CreateTopPageDto>,
  ): Promise<TopPageDocument> {
    const updatedTopPage = await this.topPageService.updateById(id, dto);
    if (!updatedTopPage) {
      throw new NotFoundException(NOT_FOUND_TOP_PAGE_EXCEPTION);
    }
    return updatedTopPage;
  }

  @HttpCode(200)
  @Post('find')
  async find(@Body() dto: FindTopPageDto): Promise<UnpackedFn<TopPageService['findByCategory']>> {
    return this.topPageService.findByCategory(dto);
  }

  @Get('findByText/:text')
  async findByText(@Param('text') text: string): Promise<TopPageDocument[]> {
    return this.topPageService.findByText(text);
  }
}
