import { DataSource } from 'typeorm';
import { seedAdmin } from './admin.seeder';
import { Admin } from '../../modules/admins/entities/admin.entities';
import { Teacher } from '../../modules/teachers/entities/teacher.entity';
import { Certificate } from '../../modules/teachers/entities/certificate.entity';
import { Usermanagement } from '../../modules/usermanagement/entities/usermanagement.entities';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeeders() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [Admin, Teacher, Certificate, Usermanagement],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    await seedAdmin(dataSource);

    console.log('All seeders completed successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
