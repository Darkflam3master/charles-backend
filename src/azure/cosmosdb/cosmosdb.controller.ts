import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CosmosDbService } from './cosmosdb.service';

@Controller('cosmosdb')
export class CosmosDbController {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  @Get()
  async getItems() {
    const query = 'SELECT * FROM c';
    return await this.cosmosDbService.getItems(query);
  }

  @Post()
  async createItem(@Body() item: any) {
    return await this.cosmosDbService.createItem(item);
  }

  @Put(':id')
  async updateItem(@Param('id') id: string, @Body() item: any) {
    return await this.cosmosDbService.updateItem(id, item);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return await this.cosmosDbService.deleteItem(id);
  }
}
