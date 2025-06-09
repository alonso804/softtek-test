import { Client, createClient } from '@libsql/client';

process.loadEnvFile('.env');

const { LIBSQL_DB_URI, LIBSQL_DB_TOKEN } = process.env;

if (!LIBSQL_DB_URI || !LIBSQL_DB_TOKEN) {
  throw new Error('Missing required environment variables: LIBSQL_DB_URI or LIBSQL_DB_TOKEN');
}

const libSQLClient = createClient({
  url: LIBSQL_DB_URI,
  authToken: LIBSQL_DB_TOKEN,
});

const TABLE = {
  PLANETS: 'planets',
  PLANETS_CUSTOM_FIELDS: 'planets_custom_fields',
} as const;

/*
type PlanetSchema = {
  id: string;
  name: string;
  coordinate_x: number;
  coordinate_y: number;
  temperature: number;
  wind_speed: number;
  population: number;
  external_id: string;
  created_at: ISODate;
  updated_at: ISODate;
};

type PlanetCustomFieldSchema = {
  id: string;
  planet_id: string;
  key: string;
  value: string;
  created_at: ISODate;
  updated_at: ISODate;
};
*/

const createTables = async (client: Client) => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE.PLANETS} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      coordinate_x REAL NOT NULL,
      coordinate_y REAL NOT NULL,
      temperature REAL NOT NULL,
      wind_speed REAL NOT NULL,
      population INTEGER NOT NULL,
      external_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS ${TABLE.PLANETS_CUSTOM_FIELDS} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planet_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (planet_id, key),
      FOREIGN KEY (planet_id) REFERENCES ${TABLE.PLANETS}(id) ON DELETE CASCADE
    )
  `);
};

const createTriggers = async (client: Client) => {
  await client.execute(`
    CREATE TRIGGER IF NOT EXISTS update_planet_updated_at
    AFTER UPDATE ON ${TABLE.PLANETS}
    FOR EACH ROW
    BEGIN
      UPDATE ${TABLE.PLANETS} SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  await client.execute(`
    CREATE TRIGGER IF NOT EXISTS update_planet_custom_field_updated_at
    AFTER UPDATE ON ${TABLE.PLANETS_CUSTOM_FIELDS}
    FOR EACH ROW
    BEGIN
      UPDATE ${TABLE.PLANETS_CUSTOM_FIELDS} SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dropAll = async (client: Client) => {
  await client.execute(`DROP TABLE IF EXISTS ${TABLE.PLANETS_CUSTOM_FIELDS}`);
  await client.execute(`DROP TABLE IF EXISTS ${TABLE.PLANETS}`);

  await client.execute(`DROP TRIGGER IF EXISTS update_planet_updated_at`);
  await client.execute(`DROP TRIGGER IF EXISTS update_planet_custom_field_updated_at`);
};

const init = async (client: Client) => {
  await createTables(client);
  await createTriggers(client);
};

init(libSQLClient);
// dropAll(libSQLClient);
