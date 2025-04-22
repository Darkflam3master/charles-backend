import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Headers,
} from '@nestjs/common';
import { CosmosDbService } from './cosmosdb.service';
import { Public } from 'src/common/decorators';

@Controller('config')
export class CosmosDbController {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  @Public()
  @Get('all')
  async getAllConfigs() {
    const query = 'SELECT * FROM c';
    return await this.cosmosDbService.getItems(query);
  }

  @Public()
  @Post()
  async createConfig(@Body() item: any) {
    return await this.cosmosDbService.createItem(item);
  }

  @Public()
  @Get('/:id')
  async getConfig(
    @Param('id') id: string,
    @Headers('x-ms-partitionkey') partitionKey: string,
    @Body() item: any,
  ) {
    return await this.cosmosDbService.updateItem(id, partitionKey, item);
  }

  @Public()
  @Put('/:id')
  async updateConfig(
    @Param('id') id: string,
    @Headers('x-ms-partitionkey') partitionKey: string,
    @Body() item: any,
  ) {
    return await this.cosmosDbService.updateItem(id, partitionKey, item);
  }

  @Delete('/:id')
  async deleteConfig(@Param('id') id: string) {
    return await this.cosmosDbService.deleteItem(id);
  }
}
