import { Container, CosmosClient, Database } from '@azure/cosmos';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators';

@Injectable()
export class CosmosDbService implements OnModuleInit {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>('COSMOSDB_ENDPOINT') || '';
    const key = this.config.get<string>('COSMOSDB_KEY') || '';

    this.client = new CosmosClient({
      endpoint,
      key,
    });
  }

  async onModuleInit() {
    const databaseId = this.config.get<string>('COSMOSDB_DATABASE_ID') || '';
    const containerId = this.config.get<string>('COSMOSDB_CONTAINER_ID') || '';

    try {
      this.database = this.client.database(databaseId);
      this.container = this.database.container(containerId);

      await this.container.items.query('SELECT 1').fetchAll(); // warm-up query

      console.log('Cosmos DB warmed up.');
    } catch (error) {
      console.error('Error warming up Cosmos DB:', error);
    }
  }

  @Public()
  async getItems(query: string) {
    const { resources: results } = await this.container.items
      .query(query)
      .fetchAll();
    return results;
  }

  async createItem(item: any) {
    const { resource: createdItem } = await this.container.items.create(item);
    return createdItem;
  }

  async updateItem(itemId: string, partitionKey: string, item: any) {
    const { resource: updatedItem } = await this.container
      .item(itemId, partitionKey)
      .replace(item);
    return updatedItem;
  }

  async deleteItem(itemId: string) {
    await this.container.item(itemId).delete();
    return { message: 'Item deleted successfully' };
  }
}
