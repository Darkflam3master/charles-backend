import { Container, CosmosClient, Database } from '@azure/cosmos';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CosmosDbService implements OnModuleInit {
  private client: CosmosClient;
  private database: Database;
  private container: Container;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>('COSMOSDB_ENDPOINT') || '';
    const key = this.config.get<string>('COSMOSDB_KEY') || '';
    const databaseId = this.config.get<string>('COSMOSDB_DATABASE_ID') || '';
    const containerId = this.config.get<string>('COSMOSDB_CONTAINER_ID') || '';
    this.client = new CosmosClient({
      endpoint,
      key,
    });

    this.database = this.client.database(databaseId);
    this.container = this.database.container(containerId);
  }

  async onModuleInit() {}

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

  async updateItem(itemId: string, item: any) {
    const { resource: updatedItem } = await this.container
      .item(itemId)
      .replace(item);
    return updatedItem;
  }

  async deleteItem(itemId: string) {
    await this.container.item(itemId).delete();
    return { message: 'Item deleted successfully' };
  }
}
