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

@Controller('cosmosdb')
export class CosmosDbController {
  constructor(private readonly cosmosDbService: CosmosDbService) {}

  @Public()
  @Get('get-all')
  async getItems() {
    console.log('contoller get all ran');
    const query = 'SELECT * FROM c';
    return await this.cosmosDbService.getItems(query);
  }

  @Public()
  @Post('user-layout')
  async createItem(@Body() item: any) {
    return await this.cosmosDbService.createItem(item);
  }

  @Public()
  @Put('/user-layout/:id')
  async updateItem(
    @Param('id') id: string,
    @Headers('x-ms-partitionkey') partitionKey: string,
    @Body() item: any,
  ) {
    return await this.cosmosDbService.updateItem(id, partitionKey, item);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return await this.cosmosDbService.deleteItem(id);
  }
}
