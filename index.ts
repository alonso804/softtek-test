import { join } from 'node:path';

import { App, Stack } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

process.loadEnvFile('.env');

const { LIBSQL_DB_URI, LIBSQL_DB_TOKEN } = process.env;

if (!LIBSQL_DB_URI || !LIBSQL_DB_TOKEN) {
  throw new Error('Missing required environment variables: LIBSQL_DB_URI or LIBSQL_DB_TOKEN');
}

export class ApiLambdaCrudDynamoDBStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    const dynamoTable = new Table(this, 'SofttekStarWars', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'SofttekCache1',
    });

    const commonsNodeJsProps: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_22_X,
      bundling: {
        externalModules: ['aws-sdk'],
      },
    };

    const fnMerge = new NodejsFunction(this, 'SofttekFnMerge1', {
      entry: join(__dirname, 'fn-merge', 'src/index.ts'),
      depsLockFilePath: join(__dirname, 'fn-merge', 'package-lock.json'),
      environment: {
        CACHE_DYNAMODB_TABLE_NAME: dynamoTable.tableName,
        LIBSQL_DB_URI: LIBSQL_DB_URI || '',
        LIBSQL_DB_TOKEN: LIBSQL_DB_TOKEN || '',
      },
      ...commonsNodeJsProps,
    });

    const fnSave = new NodejsFunction(this, 'SofttekFnSave1', {
      entry: join(__dirname, 'fn-save', 'src/index.ts'),
      depsLockFilePath: join(__dirname, 'fn-save', 'package-lock.json'),
      environment: {
        CACHE_DYNAMODB_TABLE_NAME: dynamoTable.tableName,
        LIBSQL_DB_URI: LIBSQL_DB_URI || '',
        LIBSQL_DB_TOKEN: LIBSQL_DB_TOKEN || '',
      },
      ...commonsNodeJsProps,
    });

    const fnHistory = new NodejsFunction(this, 'SofttekFnHistory1', {
      entry: join(__dirname, 'fn-history', 'src/index.ts'),
      depsLockFilePath: join(__dirname, 'fn-history', 'package-lock.json'),
      environment: {
        CACHE_DYNAMODB_TABLE_NAME: dynamoTable.tableName,
        LIBSQL_DB_URI: LIBSQL_DB_URI || '',
        LIBSQL_DB_TOKEN: LIBSQL_DB_TOKEN || '',
      },
      ...commonsNodeJsProps,
    });

    dynamoTable.grantReadWriteData(fnMerge);
    dynamoTable.grantReadWriteData(fnSave);
    dynamoTable.grantReadData(fnHistory);

    const mergeIntegration = new LambdaIntegration(fnMerge);
    const saveIntegration = new LambdaIntegration(fnSave);
    const historyIntegration = new LambdaIntegration(fnHistory);

    const api = new RestApi(this, 'SofttekStarWarsApi', {
      restApiName: 'Softtek StarWars Api',
      description: 'API for CRUD operations on Star Wars characters',
    });

    const sw = api.root.addResource('starwars');
    sw.addResource('fusionados').addMethod('GET', mergeIntegration);
    sw.addResource('almacenar').addMethod('POST', saveIntegration);
    sw.addResource('historial').addMethod('GET', historyIntegration);
  }
}

const app = new App();
new ApiLambdaCrudDynamoDBStack(app, 'SofttekTechTest');
app.synth();
