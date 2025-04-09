import { Test, TestingModule } from '@nestjs/testing';
import { CosmosDbController } from './cosmosdb.controller';

describe('CosmosdbController', () => {
  let controller: CosmosDbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosmosDbController],
    }).compile();

    controller = module.get<CosmosDbController>(CosmosDbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
