# Update Teacher Implementation Guide

## Overview

This document describes the partial update implementation for teachers in the EduMart Portal. The system allows updating specific teacher fields including profile image and master certificate only.

## Method Signature

```typescript
async update(
  id: string,
  updateTeacherDto: UpdateTeacherDto,
  files: {
    profile?: Express.Multer.File[];
    master_certificate?: Express.Multer.File[];
  },
): Promise<Teacher>
```

## Key Features

- **Partial Updates:** Only provided fields are updated, existing data is preserved
- **Selective File Uploads:** Only profile and master certificate can be updated
- **Password Security:** Automatic bcrypt hashing for password updates
- **Data Synchronization:** Updates are synced with user management table
- **Transaction Safety:** All operations wrapped in database transaction

## Implementation Flow

### 1. Transaction Initialization

```typescript
return this.dataSource.transaction(async (manager) => {
  // All operations here
});
```

### 2. Teacher Existence Check

```typescript
const teacher = await manager.findOne(Teacher, {
  where: { id },
  relations: ['certificates'],
});

if (!teacher) {
  throw new NotFoundException(`Teacher with ID ${id} not found`);
}
```

### 3. Profile Image Upload (Optional)

```typescript
if (files.profile?.[0]) {
  const uploaded = await this.cloudinaryService.uploadImage(
    files.profile[0],
    'teachers',
  );
  teacher.profile = uploaded.secure_url;
}
```

**Details:**

- Uploads to Cloudinary folder: `teachers`
- Only processes if new profile image provided
- Overwrites existing profile URL

### 4. Password Hashing (Optional)

```typescript
if (updateTeacherDto.password) {
  teacher.password = await bcrypt.hash(updateTeacherDto.password, 10);
}
```

### 5. Partial Field Updates

```typescript
if (updateTeacherDto.name !== undefined) teacher.name = updateTeacherDto.name;
if (updateTeacherDto.email !== undefined)
  teacher.email = updateTeacherDto.email;
if (updateTeacherDto.phone !== undefined)
  teacher.phone = updateTeacherDto.phone;
if (updateTeacherDto.qualification !== undefined)
  teacher.qualification = updateTeacherDto.qualification;
if (updateTeacherDto.experience !== undefined)
  teacher.experience = updateTeacherDto.experience;
if (updateTeacherDto.status !== undefined)
  teacher.status = updateTeacherDto.status;
```

**Updatable Fields:**

- name
- email
- phone
- qualification
- experience
- status
- password (auto-hashed)
- profile (via file upload)

### 6. Save Teacher Updates

```typescript
const updatedTeacher = await manager.save(teacher);
```

### 7. Master Certificate Update (Optional)

```typescript
if (files.master_certificate?.[0] && teacher.certificates?.[0]) {
  const uploaded = await this.cloudinaryService.uploadImage(
    files.master_certificate[0],
    'certificates',
  );
  teacher.certificates[0].master_certificate = uploaded.secure_url;
  await manager.save(teacher.certificates[0]);
}
```

**Important:**

- Only updates master certificate, not other certificates (x, xii, bachelor)
- Requires existing certificate record
- Uploads to Cloudinary folder: `certificates`

### 8. User Management Sync

```typescript
const userManagement = await manager.findOne(Usermanagement, {
  where: { refId: id, role: 'teacher' },
});

if (userManagement) {
  if (updateTeacherDto.name !== undefined)
    userManagement.name = updateTeacherDto.name;
  if (updateTeacherDto.email !== undefined)
    userManagement.email = updateTeacherDto.email;
  if (updateTeacherDto.password) userManagement.password = teacher.password;
  if (updateTeacherDto.status !== undefined)
    userManagement.status = updateTeacherDto.status;

  await manager.save(userManagement);
}
```

## Data Models

### UpdateTeacherDto

```typescript
export class UpdateTeacherDto extends PartialType(TeacherDTO) {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  qualification?: string;
  experience?: number;
  profile?: string;
  status?: UserStatus;
  master_certificate?: any;
}
```

**Note:** Uses `PartialType` to make all fields optional for partial updates.

## Usage Example

### Controller Endpoint

```typescript
@Put(':id')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'profile', maxCount: 1 },
    { name: 'master_certificate', maxCount: 1 },
  ])
)
async update(
  @Param('id') id: string,
  @Body() updateTeacherDto: UpdateTeacherDto,
  @UploadedFiles() files: {
    profile?: Express.Multer.File[];
    master_certificate?: Express.Multer.File[];
  },
) {
  return this.teachersService.update(id, updateTeacherDto, files);
}
```

### Update Only Name

```bash
curl -X PUT http://localhost:8000/api/v1/teachers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Update Profile Image Only

```bash
curl -X PUT http://localhost:8000/api/v1/teachers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profile=@/path/to/new-profile.jpg"
```

### Update Multiple Fields

```bash
curl -X PUT http://localhost:8000/api/v1/teachers/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=John Doe" \
  -F "phone=9876543210" \
  -F "experience=12" \
  -F "profile=@/path/to/profile.jpg" \
  -F "master_certificate=@/path/to/certificate.pdf"
```

## Error Handling

### Teacher Not Found

```typescript
throw new NotFoundException(`Teacher with ID ${id} not found`);
```

**HTTP Status:** 404 Not Found

### Transaction Rollback

If any operation fails, all changes are automatically rolled back.

## Important Notes

### What CAN Be Updated

- ✅ Profile image
- ✅ Master certificate only
- ✅ Name, email, phone, qualification, experience, status
- ✅ Password (with automatic hashing)

### What CANNOT Be Updated

- ❌ X certificate (10th grade)
- ❌ XII certificate (12th grade)
- ❌ Bachelor certificate
- ❌ Created by (admin reference)

### Partial Update Behavior

- Only fields provided in the request are updated
- Undefined/null fields are ignored (existing values preserved)
- Empty strings will update the field to empty
- Use `undefined` to skip a field, not `null`

## Security Considerations

1. **Password Hashing:** Bcrypt with 10 salt rounds
2. **Transaction Safety:** Atomic operations
3. **JWT Authentication:** Required for endpoint access
4. **File Validation:** Implement in controller layer
5. **Authorization:** Verify admin permissions

## Dependencies

```json
{
  "typeorm": "^0.3.x",
  "bcrypt": "^5.x",
  "@nestjs/common": "^10.x",
  "@nestjs/swagger": "^7.x",
  "cloudinary": "^1.x"
}
```

## Potential Improvements

1. **Old File Cleanup:** Delete old files from Cloudinary when updating
2. **Validation:** Add file type/size validation in controller
3. **Audit Trail:** Log update history
4. **Email Notification:** Notify teacher of profile changes
5. **Optimistic Locking:** Prevent concurrent update conflicts
6. **Batch Updates:** Support updating multiple teachers
7. **Rollback Handler:** Clean up Cloudinary uploads on transaction failure
