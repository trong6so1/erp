// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import typeOrmConfig from './config/typeorm.config';

export default new DataSource({
  ...typeOrmConfig,
  // override only for the CLI so it knows where to write new migrations
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  entities: [__dirname + '/**/*.entity.{tclears,js}'],
});
