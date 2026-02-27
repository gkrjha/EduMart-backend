import { DataSource } from 'typeorm';
import { Admin } from '../../modules/admins/entities/admin.entities';
import { Usermanagement } from '../../modules/usermanagement/entities/usermanagement.entities';
import { Role, UserStatus } from '../../common/enums/enum';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource) {
  const adminRepository = dataSource.getRepository(Admin);
  const userManagementRepository = dataSource.getRepository(Usermanagement);
  
  const superAdmin = adminRepository.create({
    name: 'Super Admin',
    email: 'superadmin@gmail.com',
    phone: '7589745696',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    isSasS: true,
  });

  const savedAdmin = await adminRepository.save(superAdmin);
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const userManagement = userManagementRepository.create({
    name: 'Super Admin',
    email: 'superadmin@gmail.com',
    password: hashedPassword,
    role: 'admin',
    refId: savedAdmin.id,
    status: UserStatus.ACTIVE,
  });

  await userManagementRepository.save(userManagement);
}
