import { Test, TestingModule } from '@nestjs/testing';
import { CosmosDbController } from './cosmosdb.controller';
import { CosmosDbService } from './cosmosdb.service';

describe('CosmosdbController', () => {
  let controller: CosmosDbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosmosDbController],
      providers: [
        {
          provide: CosmosDbService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CosmosDbController>(CosmosDbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
