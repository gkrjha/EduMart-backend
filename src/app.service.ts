import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      const result = await this.dataSource.query('SELECT NOW()');
      console.log('✅ Database is up! Current time:', result[0].now);
    } catch (error) {
      console.error('❌ Database query failed', error);
    }
  }
}
