import { Client } from '@libsql/client';

const TABLE = {
  PLANETS: 'planets',
  PLANETS_CUSTOM_FIELDS: 'planets_custom_fields',
} as const;

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

const fillDB = async (client: Client) => {
  await client.execute(`
    INSERT INTO ${TABLE.PLANETS} (name, coordinate_x, coordinate_y, temperature, wind_speed, population, external_id)
    VALUES
      ('Earth', 0.0, 0.0, 15.0, 5.0, 7800000000, 'ext_earth'),
      ('Mars', 1.5, -2.3, -63.0, 12.0, 0, 'ext_mars'),
      ('Venus', -1.2, 3.4, 462.0, 8.0, 0, 'ext_venus'),
      ('Jupiter', 5.2, -1.8, -145.0, 22.0, 0, 'ext_jupiter'),
      ('Saturn', 9.5, 2.3, -178.0, 16.0, 0, 'ext_saturn'),
      ('Neptune', 30.1, -1.0, -214.0, 19.0, 0, 'ext_neptune')
  `);

  await client.execute(`
    INSERT INTO ${TABLE.PLANETS_CUSTOM_FIELDS} (planet_id, key, value)
    VALUES
      (1, 'continent', 'Asia'),
      (1, 'climate', 'Temperate'),
      (3, 'atmosphere', 'Thick'),
      (4, 'rings', 'Yes'),
      (5, 'density', '0.687 g/cm³')
  `);
};

export const dropDB = async (client: Client) => {
  await client.execute(`DROP TABLE IF EXISTS ${TABLE.PLANETS_CUSTOM_FIELDS}`);
  await client.execute(`DROP TABLE IF EXISTS ${TABLE.PLANETS}`);

  await client.execute(`DROP TRIGGER IF EXISTS update_planet_updated_at`);
  await client.execute(`DROP TRIGGER IF EXISTS update_planet_custom_field_updated_at`);
};

export const emptyDB = async (client: Client) => {
  await client.execute(`DELETE FROM ${TABLE.PLANETS_CUSTOM_FIELDS}`);
  await client.execute(`DELETE FROM ${TABLE.PLANETS}`);
};

export const initDB = async (client: Client) => {
  await createTables(client);
  await createTriggers(client);

  await fillDB(client);
};

export const countRows = async (client: Client, table: (typeof TABLE)[keyof typeof TABLE]) => {
  const response = await client.execute({
    sql: `SELECT COUNT(*) AS count FROM ${table}`,
  });

  return response.rows[0]['count'] as number;
};
