# TypeORM — Complete Notes

> TypeORM ek ORM (Object Relational Mapper) hai.
> Matlab tum directly SQL nahi likhte — TypeScript classes aur decorators se database handle hota hai.
> TypeORM tumhari class ko table mein, property ko column mein, aur object ko row mein convert karta hai.
> Supported DBs: PostgreSQL, MySQL, SQLite, MongoDB, etc.

---

## Table of Contents
1. [Setup](#1-setup)
2. [Entity](#2-entity)
3. [Column Types](#3-column-types)
4. [Column Options](#4-column-options)
5. [Special Column Decorators](#5-special-column-decorators)
6. [Relations](#6-relations)
7. [Repository Pattern](#7-repository-pattern)
8. [CRUD Operations](#8-crud-operations)
9. [Find Operators](#9-find-operators)
10. [QueryBuilder](#10-querybuilder)
11. [Transactions](#11-transactions)
12. [Lifecycle Hooks](#12-lifecycle-hooks)
13. [Subscribers](#13-subscribers)
14. [Soft Delete](#14-soft-delete)
15. [Eager vs Lazy Relations](#15-eager-vs-lazy-relations)
16. [Locking](#16-locking)
17. [Embedded Entities](#17-embedded-entities)
18. [Tree Entities](#18-tree-entities)
19. [Custom Repository](#19-custom-repository)
20. [Raw Queries](#20-raw-queries)
21. [Indexes](#21-indexes)
22. [Pagination](#22-pagination)
23. [Migrations](#23-migrations)
24. [Seeding](#24-seeding)
25. [Connection Pooling](#25-connection-pooling)
26. [Common Gotchas](#26-common-gotchas)
27. [Complete Decorators Reference](#27-complete-decorators-reference)

---

## 1. Setup

```bash
npm install @nestjs/typeorm typeorm pg
```

```ts
// app.module.ts mein TypeORM register karo
TypeOrmModule.forRootAsync({ useClass: DatabaseConfigService })
```

```ts
// database.config.ts
createTypeOrmOptions(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'user',
    password: 'pass',
    database: 'mydb',
    synchronize: false,
    autoLoadEntities: true,
  };
}
```

**`synchronize`** — `true` karo toh TypeORM apne aap entity ke hisaab se table create/alter karta hai.
- `true` sirf development mein use karo
- Production mein `false` rakho — warna schema change pe data delete ho sakta hai
- Production mein migrations use karo (Section 23)

**`autoLoadEntities`** — `true` karo toh har `TypeOrmModule.forFeature([Entity])` se entity automatically register hoti hai.
- `true` recommended hai — manually entities list nahi karni padti

---

## 2. Entity

> Entity ek TypeScript class hai jo database ki ek table ko represent karti hai.
> `@Entity()` decorator lagane se TypeORM is class ko table samajhta hai.
> Har class ka object = table ki ek row.

```ts
@Entity('users')
// 'users' = table ka naam DB mein
// Agar naam nahi diya toh class name lowercase ho jata hai (User → user)
export class User {

  @PrimaryGeneratedColumn('uuid')
  // Primary key — automatically UUID generate hoti hai
  // 'uuid' ki jagah kuch nahi diya toh auto-increment integer banta hai
  id: string;

  @Column()
  // Normal column — NOT NULL by default
  name: string;
}
```

```ts
// Har module mein jahan use karna ho wahan register karo
// Yeh TypeORM ko batata hai ki is module mein User entity use hogi
TypeOrmModule.forFeature([User])
```

---

## 3. Column Types

> TypeORM TypeScript types ko automatically DB types mein convert karta hai.
> Lekin jab specific type chahiye — explicitly dena padta hai.

```ts
@Column({ type: 'varchar', length: 100 })
name: string;
// VARCHAR(100) — string, maximum 100 characters
// Kab use karein: names, titles, short text

@Column({ type: 'text' })
bio: string;
// TEXT — unlimited length string
// Kab use karein: descriptions, long content, paragraphs

@Column({ type: 'int' })
age: number;
// INTEGER — whole numbers
// Kab use karein: counts, ages, quantities

@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;
// DECIMAL(10,2) — exact decimal numbers
// precision = total digits, scale = digits after decimal
// Kab use karein: prices, amounts — float mat use karo money ke liye

@Column({ type: 'boolean' })
isActive: boolean;
// BOOLEAN — true/false
// Kab use karein: flags, status toggles

@Column({ type: 'uuid' })
refId: string;
// UUID — foreign key store karne ke liye
// Kab use karein: jab kisi doosri table ka id store karna ho

@Column({ type: 'date' })
dob: string;
// DATE — sirf date, time nahi (2024-01-15)
// Kab use karein: birthdate, joining date

@Column({ type: 'time' })
startTime: string;
// TIME — sirf time, date nahi (09:30:00)
// Kab use karein: class timings, schedules

@Column({ type: 'timestamp' })
scheduledAt: Date;
// TIMESTAMP — date + time dono (2024-01-15 09:30:00)
// Kab use karein: events, appointments, logs

@Column({ type: 'jsonb' })
metadata: object;
// JSONB — JSON data store karo aur query bhi kar sako (PostgreSQL)
// Kab use karein: flexible/dynamic data jo schema mein fit na ho

@Column({ type: 'enum', enum: Role })
role: Role;
// ENUM — sirf defined values allowed
// Kab use karein: status, roles — jab values fixed hoon

@Column({ type: 'text', array: true })
tags: string[];
// TEXT[] — PostgreSQL array
// Kab use karein: multiple values ek column mein (tags, permissions)

@Column({ type: 'enum', enum: WeekDays, array: true })
days: WeekDays[];
// ENUM[] — enum values ka array
// Kab use karein: multiple days/options select karne ke liye
```

---

## 4. Column Options

> `@Column()` mein options pass karke column ka behavior control karo.

```ts
@Column({ nullable: true })
phone?: string;
// nullable: true — column NULL ho sakta hai
// Kab use karein: optional fields jaise phone, address, bio
// Default: false (NOT NULL)

@Column({ unique: true })
email: string;
// unique: true — duplicate values nahi aayengi, DB level constraint
// Kab use karein: email, username, phone — jo unique hona chahiye

@Column({ default: 'active' })
status: string;
// default — insert pe agar value nahi di toh yeh value lagegi
// Kab use karein: status fields, flags jo mostly ek value pe start hote hain

@Column({ select: false })
password: string;
// select: false — find() mein yeh column automatically nahi aayega
// Explicitly select karna padega: select: ['id', 'password']
// Kab use karein: passwords, tokens — sensitive data jo response mein nahi chahiye

@Column({ name: 'full_name' })
fullName: string;
// name — DB mein column ka naam alag rakho, TypeScript mein alag
// Kab use karein: jab DB convention snake_case ho aur TypeScript camelCase

@Column({ length: 50 })
name: string;
// length — VARCHAR ki maximum length
// Kab use karein: jab string ki max length fix karni ho

@Column({ update: false })
createdBy: string;
// update: false — sirf insert pe set hoga, baad mein update nahi hoga
// Kab use karein: createdBy, originalValue jo kabhi change nahi honi chahiye
```

---

## 5. Special Column Decorators

> Yeh decorators automatically values set karte hain — manually set nahi karna padta.

```ts
@CreateDateColumn()
createdAt: Date;
// Insert pe automatically current timestamp set hoti hai
// Kab use karein: har entity mein — kab create hua track karne ke liye
// Khud set karne ki zarurat nahi

@UpdateDateColumn()
updatedAt: Date;
// Har update pe automatically current timestamp set hoti hai
// Kab use karein: har entity mein — kab last update hua track karne ke liye

@DeleteDateColumn()
deletedAt?: Date;
// Soft delete ke liye — softDelete() call pe timestamp set hoti hai
// Normal find() mein yeh records nahi aate
// Kab use karein: jab data permanently delete nahi karna, sirf hide karna ho
// Detail: Section 14

@VersionColumn()
version: number;
// Har save() pe automatically 1 se increment hota hai
// Optimistic locking ke liye use hota hai
// Kab use karein: concurrent updates se bachne ke liye
// Detail: Section 16

@PrimaryGeneratedColumn('uuid')
id: string;
// UUID automatically generate hoti hai — globally unique
// Kab use karein: production apps mein — predictable IDs se bachne ke liye

@PrimaryGeneratedColumn()
id: number;
// Auto-increment integer — 1, 2, 3...
// Kab use karein: simple apps, internal tables
```

---

## 6. Relations

> Relations tables ke beech connections define karte hain.
> TypeORM 4 types support karta hai.

### OneToOne — Ek se Ek

> Ek User ka sirf ek Profile, ek Profile sirf ek User ka.
> Kab use karein: jab ek entity ka data alag table mein rakhna ho (separation of concerns).

```ts
// User entity — OWNER SIDE
// Owner woh hota hai jis table mein FK column hoga
@OneToOne(() => Profile, (profile) => profile.user, {
  cascade: true,   // User save karo toh Profile bhi automatically save ho
})
@JoinColumn({ name: 'profile_id' })
// @JoinColumn — sirf owner side pe lagta hai
// Yeh batata hai ki is table mein 'profile_id' FK column hoga
profile: Profile;

// Profile entity — INVERSE SIDE
@OneToOne(() => User, (user) => user.profile)
// Inverse side pe @JoinColumn nahi lagta
user: User;
```

### OneToMany / ManyToOne — Ek se Bahut

> Ek Teacher ke many Courses. Ek Course ka sirf ek Teacher.
> Kab use karein: parent-child relationship — ek parent ke multiple children.

```ts
// Teacher entity — ONE side
@OneToMany(() => Course, (course) => course.teacher)
// OneToMany pe @JoinColumn nahi lagta — FK doosri table mein hoti hai
// courses property mein array aayega
courses: Course[];

// Course entity — MANY side (yahan FK column hoga)
@ManyToOne(() => Teacher, (teacher) => teacher.courses, {
  onDelete: 'CASCADE',
  // Teacher delete ho toh uske sab courses bhi delete ho jayein
})
@JoinColumn({ name: 'teacher_id' })
// ManyToOne pe @JoinColumn optional hai — naam customize karne ke liye
teacher: Teacher;

@Column({ type: 'uuid' })
teacher_id: string;
// FK column explicitly rakh sakte ho — sirf ID chahiye toh poora object load nahi karna
```

### ManyToMany — Bahut se Bahut

> Ek Course ki many Specializations. Ek Specialization ke many Courses.
> Automatically ek junction/pivot table banta hai dono ke IDs store karne ke liye.
> Kab use karein: jab dono sides pe multiple records ho sakte hain.

```ts
// Course entity — OWNER SIDE
@ManyToMany(() => Specialization, (spec) => spec.courses)
@JoinTable({
  name: 'course_specializations',        // junction table ka naam
  joinColumn: { name: 'course_id' },     // is table ka FK
  inverseJoinColumn: { name: 'spec_id' }, // doosri table ka FK
})
// @JoinTable sirf ek side pe lagta hai (owner side)
specializations: Specialization[];

// Specialization entity — INVERSE SIDE
@ManyToMany(() => Course, (course) => course.specializations)
// Inverse side pe @JoinTable nahi lagta
courses: Course[];
```

### Cascade Options

```ts
cascade: true
// insert, update, remove — sab operations propagate honge
// Kab use karein: jab child entity parent ke saath hi manage honi ho

cascade: ['insert']
// Sirf insert propagate hoga
// Kab use karein: create pe related entity bhi create ho, baad mein independent ho

cascade: ['insert', 'update']
// Insert aur update propagate honge

onDelete: 'CASCADE'
// DB level — parent delete ho toh children bhi delete ho
// Kab use karein: child records parent ke bina meaningless hain

onDelete: 'SET NULL'
// Parent delete ho toh FK null ho jaye
// Kab use karein: child records parent ke bina bhi exist kar sakte hain

onDelete: 'RESTRICT'
// Parent delete block ho agar children hain
// Kab use karein: accidental deletion se bachna ho
```

### @RelationId — Sirf FK ID Load Karna

```ts
@ManyToOne(() => Teacher)
teacher: Teacher;

@RelationId((course: Course) => course.teacher)
teacherId: string;
// Poora teacher object load karne ki jagah sirf teacher_id milega
// Kab use karein: jab sirf FK ID chahiye, poora object nahi — performance better hoti hai
```

---

## 7. Repository Pattern

> Repository ek interface hai jo database operations provide karta hai ek specific entity ke liye.
> TypeORM mein do tarike hain.

### Method 1 — @InjectRepository

> Kab use karein: simple CRUD operations ke liye — find, save, delete.
> NestJS DI system se inject hota hai.

```ts
// Step 1: Module mein register karo — ZAROORI HAI
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  // Yeh TypeORM ko batata hai ki UserService ko User ka repository chahiye
})

// Step 2: Service mein inject karo
constructor(
  @InjectRepository(User)
  // @InjectRepository — TypeORM ko batata hai kaunsi entity ka repo chahiye
  private readonly userRepo: Repository<User>,
) {}

// Step 3: Use karo
const users = await this.userRepo.find();
```

### Method 2 — DataSource

> Kab use karein: transactions ke liye, multiple entities ek saath handle karne ke liye.
> DataSource poore database connection ka access deta hai.

```ts
constructor(private readonly dataSource: DataSource) {}
// DataSource inject karo — koi forFeature() ki zarurat nahi

// Repository nikalo jab chahiye
const userRepo = this.dataSource.getRepository(User);

// Transaction ke andar manager use karo
await this.dataSource.transaction(async (manager) => {
  // manager = transaction-aware entity manager
  // Iske through kiye sab operations ek transaction mein honge
  await manager.save(User, userData);
  await manager.save(Profile, profileData);
});
```

**Kab kya use karein:**

| Situation | Use |
|---|---|
| Simple find, save, delete | `@InjectRepository` |
| Multiple entities ek saath save karne hain | `DataSource` |
| Transaction chahiye | `DataSource` |
| Ek service mein dono | Avoid karo — consistency rakho |

---

## 8. CRUD Operations

### create() — Object Banana

```ts
const user = this.userRepo.create({ name: 'Ali', email: 'ali@test.com' });
// create() sirf TypeScript object banata hai — DB mein kuch nahi jata
// Kab use karein: save() se pehle — validation, hooks ke liye
// Agar seedha save() karo toh create() ki zarurat nahi
```

### save() — Insert ya Update

```ts
// Insert — naya record
const user = this.userRepo.create({ name: 'Ali' });
const saved = await this.userRepo.save(user);
// save() — agar id nahi hai toh INSERT, agar id hai toh UPDATE
// Lifecycle hooks chalte hain (@BeforeInsert, @AfterInsert)
// Relations bhi save hoti hain agar cascade: true ho

// Seedha save() — create() ke bina bhi kaam karta hai
const saved = await this.userRepo.save({ name: 'Ali', email: 'ali@test.com' });

// Bulk insert
await this.userRepo.save([{ name: 'Ali' }, { name: 'Ahmed' }]);
// Array pass karo — sab ek saath save honge
```

### find() — Multiple Records

```ts
// Sab records
const users = await this.userRepo.find();

// Conditions ke saath
const users = await this.userRepo.find({
  where: { status: 'active' },
  // where — SQL WHERE clause
});

// Relations ke saath
const users = await this.userRepo.find({
  where: { status: 'active' },
  relations: ['courses', 'profile'],
  // relations — JOIN karke related data bhi load karo
  // Agar nahi diya toh courses/profile undefined aayega
});

// Sorting
const users = await this.userRepo.find({
  order: { createdAt: 'DESC', name: 'ASC' },
  // order — SQL ORDER BY
});

// Pagination
const users = await this.userRepo.find({
  skip: 0,   // kitne records skip karo (offset)
  take: 10,  // kitne records lo (limit)
});

// Count ke saath — pagination ke liye
const [users, total] = await this.userRepo.findAndCount({
  skip: 0,
  take: 10,
});
// total = overall matching records ki count
```

### findOne() — Single Record

```ts
const user = await this.userRepo.findOne({
  where: { email: 'ali@test.com' },
  // where — condition
});
// Milega toh User object, nahi milega toh null

// Sirf kuch columns select karo
const user = await this.userRepo.findOne({
  where: { id },
  select: ['id', 'name', 'email'],
  // select — sirf yeh columns load karo
  // Kab use karein: password jaise sensitive fields hide karne ke liye
  // Ya performance ke liye — sirf zaruri columns lo
});

// OR conditions — array use karo
const user = await this.userRepo.findOne({
  where: [
    { email: 'ali@test.com' },
    { phone: '03001234567' },
  ],
  // Array = OR — koi bhi condition match kare
});
```

### update() — Fast Update

```ts
await this.userRepo.update(id, { name: 'New Name' });
// Seedha SQL UPDATE — entity load nahi hoti
// FAST — ek query
// Kab use karein: simple field update, relations update nahi karni

await this.userRepo.update({ email: 'ali@test.com' }, { status: 'inactive' });
// Condition se bhi update kar sakte ho

// LIMITATION: Lifecycle hooks nahi chalte, relations update nahi hoti
// Agar hooks chahiye ya relations update karni hain toh findOne() + save() use karo
```

### delete() — Fast Delete

```ts
const result = await this.userRepo.delete(id);
// Seedha SQL DELETE — entity load nahi hoti
// FAST — ek query
// Kab use karein: simple delete, hooks ki zarurat nahi

if (result.affected === 0) {
  throw new NotFoundException('User not found');
}
// affected — kitne rows delete hue
// 0 matlab record mila hi nahi

await this.userRepo.delete({ status: 'inactive' });
// Condition se bulk delete

// LIMITATION: Lifecycle hooks nahi chalte
```

### remove() — Delete with Hooks

```ts
const user = await this.userRepo.findOne({ where: { id } });
// Pehle entity load karni padti hai — extra query

await this.userRepo.remove(user);
// @BeforeRemove, @AfterRemove hooks chalte hain
// Kab use karein: jab hooks chahiye ya cascade remove karna ho
```

---

## 9. Find Operators

> `where` clause mein complex conditions ke liye.
> Yeh TypeScript functions hain jo SQL operators generate karte hain.

```ts
import { Equal, Not, Like, ILike, In, IsNull, Between,
         MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual,
         ArrayContains, Raw } from 'typeorm';
```

```ts
where: { status: 'active' }
where: { status: Equal('active') }
// Dono same hain — Equal() explicitly likhne ki zarurat nahi
// SQL: WHERE status = 'active'

where: { status: Not('inactive') }
// NOT equal
// SQL: WHERE status != 'inactive'

where: { deletedAt: Not(IsNull()) }
// NULL nahi hai
// SQL: WHERE deleted_at IS NOT NULL

where: { name: Like('%ali%') }
// Case SENSITIVE pattern match
// SQL: WHERE name LIKE '%ali%'
// % = wildcard (kuch bhi)

where: { name: ILike('%ali%') }
// Case INSENSITIVE — PostgreSQL specific
// SQL: WHERE name ILIKE '%ali%'
// Kab use karein: search functionality mein — user Ali ya ali ya ALI likhe sab match ho

where: { role: In(['admin', 'teacher']) }
// Array mein se koi bhi value
// SQL: WHERE role IN ('admin', 'teacher')
// Kab use karein: multiple allowed values check karne ke liye

where: { deletedAt: IsNull() }
// NULL check
// SQL: WHERE deleted_at IS NULL
// Kab use karein: soft deleted records filter karne ke liye

where: { price: Between(100, 500) }
// Range check — inclusive
// SQL: WHERE price BETWEEN 100 AND 500
// Kab use karein: price range, age range, date range filters

where: { age: MoreThan(18) }
// SQL: WHERE age > 18

where: { age: MoreThanOrEqual(18) }
// SQL: WHERE age >= 18

where: { price: LessThan(1000) }
// SQL: WHERE price < 1000

where: { price: LessThanOrEqual(1000) }
// SQL: WHERE price <= 1000

where: { tags: ArrayContains(['typescript']) }
// PostgreSQL array column mein value hai
// SQL: WHERE tags @> ARRAY['typescript']
// Kab use karein: array columns mein specific value dhundne ke liye

where: { createdAt: Raw(alias => `${alias} > NOW() - INTERVAL '7 days'`) }
// Custom SQL — jab koi operator kaafi na ho
// alias = column ka DB naam
// Kab use karein: complex date/time conditions, DB-specific functions
```

---

## 10. QueryBuilder

> Complex queries ke liye — joins, aggregations, subqueries, dynamic conditions.
> `find()` se zyada control milta hai lekin zyada verbose bhi hai.
> Kab use karein: jab `find()` se kaam na chale.

```ts
// createQueryBuilder('alias')
// 'user' = alias — query mein is naam se refer karenge
const qb = this.userRepo.createQueryBuilder('user');
```

### Joins

```ts
.leftJoinAndSelect('user.courses', 'course')
// LEFT JOIN — user ke courses join karo aur SELECT mein bhi include karo
// 'course' = join ka alias
// Kab use karein: related data bhi response mein chahiye

.leftJoin('user.profile', 'profile')
// LEFT JOIN — sirf join karo, SELECT mein include mat karo
// Kab use karein: sirf WHERE condition mein use karna ho, data nahi chahiye

.innerJoinAndSelect('user.courses', 'course')
// INNER JOIN — sirf woh users jo kam se kam ek course mein hain
// Kab use karein: sirf woh records chahiye jinka relation exist karta ho
```

### Where Conditions

```ts
.where('user.status = :status', { status: 'active' })
// :status = named parameter — SQL injection safe
// Hamesha parameters is tarah pass karo, string concatenation mat karo

.andWhere('user.role = :role', { role: 'teacher' })
// AND condition add karo

.orWhere('user.email ILIKE :email', { email: '%@gmail.com' })
// OR condition add karo

.where('user.role IN (:...roles)', { roles: ['admin', 'teacher'] })
// :...roles = array spread — IN clause ke liye
```

### Select

```ts
.select(['user.id', 'user.name', 'user.email'])
// Sirf yeh columns select karo — baaki nahi aayenge
// Kab use karein: performance ke liye, sensitive data hide karne ke liye

.addSelect('course.title')
// Aur yeh column bhi add karo
// Kab use karein: join ke baad related column bhi chahiye
```

### Order, Skip, Take

```ts
.orderBy('user.createdAt', 'DESC')
// Primary sort

.addOrderBy('user.name', 'ASC')
// Secondary sort

.skip(0)
// Offset — kitne records skip karo
// Kab use karein: pagination mein (page - 1) * limit

.take(10)
// Limit — maximum kitne records lo
```

### Aggregations

```ts
.select('COUNT(user.id)', 'total')
// COUNT — kitne records hain
// 'total' = alias — result mein is naam se aayega

.addSelect('AVG(user.age)', 'avgAge')
// AVG — average

.addSelect('SUM(order.amount)', 'totalAmount')
// SUM — total

.groupBy('user.role')
// GROUP BY — role ke hisaab se group karo

.having('COUNT(user.id) > :count', { count: 5 })
// HAVING — grouped results pe condition
// WHERE aggregation pe nahi lagta — HAVING lagta hai

.getRawOne<{ total: string; avgAge: string }>()
// getRawOne() — plain object return karta hai
// Kab use karein: aggregations ke liye — entity mapping nahi hoti
```

### loadRelationCountAndMap

```ts
.loadRelationCountAndMap('user.courseCount', 'user.courses')
// user.courses relation ka count load karo
// user.courseCount property mein number aa jayega
// Kab use karein: sirf count chahiye, poora array nahi
// Performance better — array load nahi hota
```

### Result Methods

```ts
.getMany()
// Array of entities return karta hai
// Kab use karein: multiple records chahiye

.getOne()
// Single entity ya null return karta hai
// Kab use karein: ek specific record chahiye

.getManyAndCount()
// [entities[], total] return karta hai
// Kab use karein: pagination — data aur total count dono chahiye

.getRawMany<T>()
// Plain objects ka array — entity mapping nahi
// Kab use karein: aggregations, custom SELECT

.getRawOne<T>()
// Single plain object
// Kab use karein: single aggregation result
```

---

## 11. Transactions

> Transaction mein multiple DB operations ek unit ki tarah kaam karti hain.
> Ya sab succeed hoti hain, ya koi bhi nahi — data consistent rehta hai.
> Kab use karein: jab 2 ya zyada related operations hoon jo sab honi chahiye ya koi nahi.

### Method 1 — dataSource.transaction() (RECOMMENDED)

```ts
await this.dataSource.transaction(async (manager) => {
  // manager = transaction-aware entity manager
  // Is manager se kiye sab operations ek transaction mein hain

  const user = manager.create(User, { name: 'Ali' });
  await manager.save(user);
  // Agar yeh fail hua toh...

  await manager.save(Usermanagement, { refId: user.id, role: 'student' });
  // ...yeh bhi rollback ho jayega

  // Koi error nahi aya toh automatically COMMIT ho jayega
  // Error aya toh automatically ROLLBACK ho jayega
});
```

Kab use karein: 90% cases ke liye — clean aur simple.

### Method 2 — QueryRunner (Manual Control)

```ts
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
// Connection pool se connection lo

await queryRunner.startTransaction();
// Transaction shuru karo

try {
  await queryRunner.manager.save(User, userData);
  await queryRunner.manager.save(Profile, profileData);

  await queryRunner.commitTransaction();
  // Sab theek — changes permanently save karo

} catch (error) {
  await queryRunner.rollbackTransaction();
  // Kuch galat hua — sab changes undo karo
  throw error;

} finally {
  await queryRunner.release();
  // Connection wapas pool mein do
  // HAMESHA finally mein karo — warna connection leak hoga
}
```

Kab use karein: jab manually commit/rollback control karna ho, ya intermediate commits chahiye.

**Comparison:**

| | `dataSource.transaction()` | `QueryRunner` |
|---|---|---|
| Code | Clean, short | Verbose |
| Control | Automatic | Manual |
| Use case | 90% cases | Special cases |
| Error handling | Automatic rollback | Manual rollback |

---
