import { Module } from '@nestjs/common';
import { CosmosDbService } from './cosmosdb.service';
import { CosmosDbController } from './cosmosdb.controller';

@Module({
  providers: [CosmosDbService],
  exports: [CosmosDbService],
  controllers: [CosmosDbController],
})
export class CosmosDbModule {}
