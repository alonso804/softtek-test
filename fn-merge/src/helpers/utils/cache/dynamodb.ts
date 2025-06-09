import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CONFIG } from 'src/config';

import { convertTime } from '../convert-time';
import { CacheUtils, SetProps } from '.';

type CacheItem<T = unknown> = {
  id: string;
  value: T;
  ttl: number;
  createdAt: number;
};

export class CacheDynamoDbUtils extends CacheUtils {
  #client: DynamoDBClient;
  #tableName = CONFIG.CACHE_DYNAMODB_TABLE_NAME;

  constructor(dependencies: { dynamoDBClient: DynamoDBClient }) {
    super();
    this.#client = dependencies.dynamoDBClient;
  }
  async find<Output>(key: string): Promise<Output | null> {
    console.group('[CacheDynamoDbUtils] find');
    console.log({ key });

    const command = new GetCommand({
      TableName: this.#tableName,
      Key: { id: key },
    });

    const response = await this.#client.send(command);

    const item = response.Item as CacheItem<Output> | undefined;

    console.log(
      JSON.stringify({
        id: item?.id,
        value: item?.value,
        ttl: item?.ttl ? new Date(item.ttl).toISOString() : undefined,
        createAt: item?.createdAt ? new Date(item.createdAt).toISOString() : undefined,
      }),
    );

    console.groupEnd();

    if (!item) {
      return null;
    }

    if (item.ttl < Date.now()) {
      await this.remove(key);

      return null;
    }

    return item.value;
  }

  async set<Input>({ key, value, ttl }: SetProps<Input>): Promise<void> {
    console.log(`[CacheDynamoDbUtils] Setting key: ${key} with TTL: ${JSON.stringify(ttl)}`);

    const item: CacheItem<Input> = {
      id: key,
      value,
      ttl: Date.now() + convertTime(ttl, 'milliseconds'),
      createdAt: Date.now(),
    };
    // dont insert item if it already exists
    const command = new PutCommand({
      TableName: this.#tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    const response = await this.#client.send(command);

    console.log(`[CacheDynamoDbUtils] Set response: ${JSON.stringify(response, null, 2)}`);
  }

  async remove(key: string): Promise<void> {
    console.log(`[CacheDynamoDbUtils] Removing key: ${key}`);

    const command = new DeleteCommand({
      TableName: this.#tableName,
      Key: { id: key },
    });

    await this.#client.send(command);
  }
}
