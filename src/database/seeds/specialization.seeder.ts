import { DataSource } from 'typeorm';
import { Specialization } from '../../modules/specializations/entities/specialization.entity';

export async function seedSpecializations(dataSource: DataSource) {
  const specializationRepository = dataSource.getRepository(Specialization);

  const specializations = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cyber Security',
    'Cloud Computing',
    'Web Development',
    'Mobile App Development',
    'Game Development',
    'Blockchain Technology',
    'Internet of Things',
    'DevOps',
    'UI/UX Design',
    'Digital Marketing',
    'Business Administration',
    'Finance',
    'Accounting',
    'Economics',
    'Human Resource Management',
    'Marketing',
    'International Business',
    'Entrepreneurship',
    'Supply Chain Management',
    'Project Management',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Environmental Engineering',
    'Industrial Engineering',
    'Architecture',
    'Biotechnology',
    'Pharmacy',
    'Nursing',
    'Medicine',
    'Psychology',
    'Sociology',
    'Political Science',
    'Law',
    'Education',
    'Journalism',
    'Mass Communication',
    'Graphic Design',
    'Animation',
    'Hospitality Management',
  ];

  for (const name of specializations) {
    const exists = await specializationRepository.findOne({
      where: { name },
    });

    if (!exists) {
      const specialization = specializationRepository.create({ name });
      await specializationRepository.save(specialization);
    }
  }

  console.log('Specializations seeded successfully');
}
