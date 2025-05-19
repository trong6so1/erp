# Dự án NestJS Module-Based với Domain-Driven Design

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![DDD](https://img.shields.io/badge/DDD-22ADF6?style=for-the-badge)
![CQRS](https://img.shields.io/badge/CQRS-43853D?style=for-the-badge)

## 📁 Giới thiệu tổng quan kiến trúc dự án

Dự án này được xây dựng trên nền tảng NestJS, áp dụng kiến trúc module-based kết hợp với nguyên tắc Domain-Driven Design (DDD) và các design pattern hiện đại như Repository Pattern và Command Query Responsibility Segregation (CQRS).

Kiến trúc này giúp tạo ra một codebase có tính bảo trì cao, dễ mở rộng và phù hợp với các ứng dụng phức tạp, đồng thời tận dụng được các ưu điểm của framework NestJS như dependency injection, module system và decorators.

### Đặc điểm nổi bật:

- **Phân tách mối quan tâm (Separation of Concerns)**: Code được tổ chức thành các lớp rõ ràng với trách nhiệm cụ thể
- **Khả năng kiểm thử cao (Testability)**: Các thành phần được thiết kế để dễ dàng mocking và testing
- **Cô lập miền ứng dụng (Domain Isolation)**: Các business logic được đóng gói trong domain
- **Khả năng mở rộng (Scalability)**: Dễ dàng thêm tính năng mới mà không ảnh hưởng đến code hiện tại

## 🧱 Cấu trúc thư mục (Module-based + DDD elements)

```
src/
├── modules/                 # Các module chức năng của dự án
│   ├── user/                # Module User (ví dụ)
│   │   ├── domain/          # Domain Layer - Miền ứng dụng
│   │   │   ├── entities/    # Các entity trong domain
│   │   │   ├── value-objects/  # Value Objects
│   │   │   ├── events/      # Domain events
│   │   │   └── interfaces/  # Interface cho repository, service,...
│   │   │
│   │   ├── application/     # Application Layer - Xử lý use case
│   │   │   ├── commands/    # Command handlers (CQRS)
│   │   │   ├── queries/     # Query handlers (CQRS)
│   │   │   ├── dtos/        # Data Transfer Objects
│   │   │   └── services/    # Application services
│   │   │
│   │   ├── infrastructure/  # Infrastructure Layer
│   │   │   ├── database/    # Database mappings, ORM configs
│   │   │   ├── repositories/ # Repository implementations
│   │   │   └── services/    # External service implementations
│   │   │
│   │   └── interfaces/      # Interface Layer
│   │       ├── controllers/ # REST API controllers
│   │       ├── graphql/     # GraphQL resolvers (nếu có)
│   │       └── websockets/  # WebSocket gateways (nếu có)
│   │
│   └── [module-khác]/      # Các module khác tương tự
│
├── shared/                 # Code dùng chung cho toàn ứng dụng
│   ├── domain/             # Domain primitives, base entities
│   ├── infrastructure/     # Shared infrastructure utilities
│   └── interfaces/         # Shared interfaces (middlewares, guards...)
│
├── config/                 # Cấu hình ứng dụng
├── app.module.ts           # Root module
└── main.ts                # Entry point
```

### Giải thích các lớp trong kiến trúc:

#### 1. Domain Layer
- **Trách nhiệm**: Chứa business logic và quy tắc nghiệp vụ core
- **Thành phần**:
  - **Entities**: Các đối tượng có định danh, thể hiện khái niệm trong domain
  - **Value Objects**: Đối tượng không có ID riêng, đại diện cho giá trị
  - **Domain Events**: Sự kiện phát sinh trong domain
  - **Domain Services**: Logic nghiệp vụ không thuộc về entity cụ thể
  - **Repository Interfaces**: Định nghĩa cách truy xuất và lưu trữ đối tượng

#### 2. Application Layer
- **Trách nhiệm**: Điều phối các use case, xử lý giao tiếp giữa domain và interfaces
- **Thành phần**:
  - **Commands**: Đại diện cho thao tác ghi/thay đổi dữ liệu
  - **Command Handlers**: Xử lý các command
  - **Queries**: Đại diện cho thao tác đọc dữ liệu
  - **Query Handlers**: Xử lý các query
  - **DTOs**: Đối tượng chuyển đổi dữ liệu
  - **Application Services**: Điều phối workflow

#### 3. Infrastructure Layer
- **Trách nhiệm**: Cung cấp triển khai cụ thể cho các interface trong domain
- **Thành phần**:
  - **Repository Implementations**: Triển khai cụ thể cho repository interfaces
  - **Database Mappings**: Cấu hình ORM, ánh xạ database
  - **External Services**: Tích hợp dịch vụ bên thứ ba

#### 4. Interface Layer
- **Trách nhiệm**: Xử lý tương tác với bên ngoài
- **Thành phần**:
  - **Controllers**: Xử lý HTTP requests
  - **GraphQL Resolvers**: Xử lý GraphQL queries/mutations
  - **WebSocket Gateways**: Xử lý WebSocket connections

## 🧩 Design Pattern: Repository Pattern + CQRS

### Repository Pattern

Repository pattern tạo ra một lớp trung gian giữa domain logic và dữ liệu, giúp tách biệt business logic khỏi cơ sở dữ liệu và đảm bảo tính đóng gói.

**Ý nghĩa**:
- Cung cấp abstraction cho việc truy xuất dữ liệu
- Domain không phụ thuộc vào cách dữ liệu được lưu trữ
- Dễ dàng thay đổi database mà không ảnh hưởng đến domain logic
- Hỗ trợ tốt cho việc unit testing

**Ví dụ**:

1. **Định nghĩa interface trong domain**:

```ts
// src/modules/user/domain/interfaces/user-repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

2. **Triển khai cụ thể trong infrastructure**:

```ts
// src/modules/user/infrastructure/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { UserEntity } from '../database/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly mapper: UserMapper,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { id } });
    return userEntity ? this.mapper.toDomain(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ where: { email } });
    return userEntity ? this.mapper.toDomain(userEntity) : null;
  }

  async save(user: User): Promise<User> {
    const userEntity = this.mapper.toPersistence(user);
    const saved = await this.repository.save(userEntity);
    return this.mapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### CQRS (Command Query Responsibility Segregation)

CQRS là pattern tách biệt các thao tác đọc (Queries) và ghi (Commands) thành các model riêng biệt, giúp tối ưu hóa hiệu suất và đơn giản hóa code.

**Ý nghĩa**:
- Tách biệt mô hình đọc và ghi
- Tối ưu hóa theo từng mục đích sử dụng
- Dễ dàng mở rộng và bảo trì
- Phù hợp với NestJS CQRS module

**Ví dụ**:

1. **Command**:

```ts
// src/modules/user/application/commands/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
  ) {}
}
```

2. **Command Handler**:

```ts
// src/modules/user/application/commands/handlers/create-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { email, password, fullName } = command;
    
    // Kiểm tra user đã tồn tại
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Tạo user mới từ domain entity
    const user = User.create({
      email,
      password, // Giả sử đã mã hóa
      fullName,
    });

    // Lưu user và trả về ID
    const savedUser = await this.userRepository.save(user);
    return savedUser.id;
  }
}
```

3. **Query**:

```ts
// src/modules/user/application/queries/get-user.query.ts
export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}
```

4. **Query Handler**:

```ts
// src/modules/user/application/queries/handlers/get-user.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from '../get-user.query';
import { UserDto } from '../../dtos/user.dto';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto | null> {
    const { id } = query;
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return null;
    }
    
    // Chuyển đổi từ domain entity sang DTO
    return this.userMapper.toDto(user);
  }
}
```

5. **Sử dụng trong controller**:

```ts
// src/modules/user/interfaces/controllers/user.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/commands/create-user.command';
import { GetUserByIdQuery } from '../../application/queries/get-user.query';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UserDto } from '../../application/dtos/user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{ id: string }> {
    const { email, password, fullName } = createUserDto;
    const id = await this.commandBus.execute(
      new CreateUserCommand(email, password, fullName),
    );
    return { id };
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }
}
```

## ⚙️ Quy tắc coding & guideline mở rộng module

### Quy ước đặt tên

1. **Thư mục và tệp tin**:
   - Sử dụng kebab-case: `user-profile.service.ts`
   - Tên tệp tin nên kết thúc với loại tệp tin: `.entity.ts`, `.service.ts`, `.controller.ts`, etc.
   - Module chức năng: Tên miền chính (user, product, order...)

2. **Class**:
   - PascalCase cho tên class: `UserService`, `CreateUserCommand`
   - Thêm hậu tố phù hợp với loại class: `UserController`, `UserRepository`

3. **Interface**:
   - PascalCase với tiền tố "I": `IUserRepository`, `IPaymentService`

4. **Biến và hàm**:
   - camelCase: `getUserById()`, `createOrder()`
   - Sử dụng động từ cho tên hàm: `findAll()`, `validateUser()`

### Quy tắc và nguyên tắc

1. **Domain Layer**:
   - Không phụ thuộc vào các layer khác
   - Chỉ chứa business logic thuần túy
   - Không liên quan đến framework hoặc infrastructure

2. **Application Layer**:
   - Chỉ phụ thuộc vào Domain Layer
   - Mỗi use case xử lý một command hoặc query cụ thể
   - Không chứa business logic phức tạp

3. **Infrastructure Layer**:
   - Triển khai các interface từ Domain Layer
   - Xử lý chi tiết kỹ thuật như database, external services
   - Chuyển đổi giữa domain models và persistence models

4. **Interface Layer**:
   - Chỉ xử lý request/response, không chứa business logic
   - Sử dụng CommandBus/QueryBus để giao tiếp với Application Layer
   - Xác thực đầu vào của người dùng

### Hướng dẫn mở rộng module

Khi cần thêm module mới, hãy thực hiện theo các bước sau:

1. **Xác định domain model**:
   - Tạo entities và value objects
   - Định nghĩa các quy tắc nghiệp vụ và invariants
   - Thiết kế các interfaces cho repository

2. **Thiết kế application use cases**:
   - Xác định các commands và queries
   - Tạo DTOs cho input/output
   - Viết command/query handlers

3. **Triển khai infrastructure**:
   - Tạo schema/entity cho database
   - Triển khai repository interfaces
   - Cấu hình ORM nếu cần

4. **Xây dựng interface layer**:
   - Tạo controllers/resolvers
   - Triển khai các endpoints API
   - Viết các responses handlers

5. **Đăng ký module**:
   - Đảm bảo đăng ký module với NestJS module system
   - Cấu hình dependency injection
   - Import vào AppModule hoặc module cha

### Ví dụ thêm một feature vào module User

Giả sử bạn muốn thêm tính năng "Thay đổi mật khẩu":

1. **Domain**:
   - Thêm method `changePassword()` vào User entity
   - Đảm bảo tính hợp lệ của mật khẩu trong domain

2. **Application**:
   - Tạo `ChangePasswordCommand` và `ChangePasswordCommandHandler`
   - Tạo DTO cho input: `ChangePasswordDto`

3. **Infrastructure**:
   - Đảm bảo repository có phương thức lưu thay đổi

4. **Interface**:
   - Thêm endpoint API trong UserController

## 🚀 Cách build và chạy ứng dụng

### Yêu cầu hệ thống

- Node.js (v16+)
- npm hoặc yarn
- Database (PostgreSQL, MySQL, etc.)

### Cài đặt

1. Clone repository:

```bash
git clone https://your-repo-url.git
cd your-project
```

2. Cài đặt dependencies:

```bash
npm install
# hoặc
yarn install
```

3. Tạo file .env:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=nestjs_app
JWT_SECRET=your_jwt_secret
```

### Chạy ứng dụng

#### Development mode:

```bash
npm run start:dev
# hoặc
yarn start:dev
```

#### Production build:

```bash
npm run build
npm run start:prod
# hoặc
yarn build
yarn start:prod
```

#### Chạy tests:

```bash
# Unit tests
npm run test
# hoặc
yarn test

# E2E tests
npm run test:e2e
# hoặc
yarn test:e2e
```

### Docker

Dự án cũng hỗ trợ Docker:

```bash
# Build image
docker build -t your-app-name .

# Run container
docker run -p 3000:3000 your-app-name
```

## Kết luận

Kiến trúc dự án này được thiết kế để đảm bảo tính bảo trì cao, khả năng kiểm thử tốt và mở rộng dễ dàng. Bằng cách kết hợp nguyên tắc DDD, Repository Pattern và CQRS, chúng ta có thể xây dựng các ứng dụng NestJS phức tạp với codebase rõ ràng và dễ quản lý.

Hãy đảm bảo tuân thủ các quy tắc và hướng dẫn được mô tả trong tài liệu này để duy trì tính nhất quán và chất lượng của dự án.
```