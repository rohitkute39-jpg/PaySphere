# PaySphere - Architecture Design

## 1. Architecture Overview

PaySphere follows a modular monolithic architecture consisting of:

- React frontend application.
- Spring Boot REST API.
- MySQL relational database.

The backend is deployed as one application, with responsibilities separated into employee, department, compensation, and security modules.

This architecture keeps deployment simple while maintaining separation of business responsibilities.

## 2. Technology Choices

### Backend
- Java 21
- Spring Boot
- Spring MVC and REST APIs
- Spring Data JPA and Hibernate
- Spring Security and JWT authentication
- MySQL 8
- Maven

### Frontend
- React 19
- Vite
- JavaScript
- CSS

### Testing
- JUnit and Mockito
- Vitest
- React Testing Library

## 3. Backend Modules

### Employee Module
Manages employee profiles, including employee number, name, email, phone, country code, designation, department, joining date, and employment status.

Provides employee creation, retrieval, updating, and listing operations.

### Department Module
Manages department master data, including department code, name, description, and active status.

Provides department creation and retrieval operations.

### Compensation Module
Manages annual salary records, currency codes, effective dates, and revision reasons.

When a new compensation record is created, the previous current record is closed by setting its effective end date. The new record becomes the current compensation record.

### Security Module
Provides administrator initialization, authentication, password hashing, JWT-based authentication, and role-based authorization.

## 4. Database Design

The application uses four primary relational tables:

- `employees` - Employee profile and employment information.
- `departments` - Department master data.
- `compensation_records` - Annual salary records and compensation history.
- `app_users` - Application user credentials and roles.

Employees reference departments through a foreign key. Compensation records reference employees.

Employee country information is stored using a country code rather than a separate country master table.

Salary values use `DECIMAL(19,2)` and retain a three-character currency code. Different currencies must not be treated as directly comparable without an exchange-rate policy.

Compensation history is maintained through effective dates in `compensation_records`. The current implementation does not use a separate salary audit-log table or Hibernate Envers.

## 5. API Design

The backend exposes the following REST endpoints:

### Authentication
- `POST /api/v1/auth/login`

### Employees
- `POST /api/v1/employees`
- `PUT /api/v1/employees/{id}`
- `GET /api/v1/employees/{id}`
- `GET /api/v1/employees`

### Departments
- `POST /api/v1/departments`
- `GET /api/v1/departments`
- `GET /api/v1/departments/{id}`

### Compensation
- `POST /api/v1/compensation/employees/{employeeId}`
- `GET /api/v1/compensation/employees/{employeeId}/history`
- `GET /api/v1/compensation/employees/{employeeId}/current`
- `GET /api/v1/compensation/current`

The API uses request validation, DTOs, and centralized exception handling.

## 6. Performance and Scalability

The assessment dataset target is 10,000 employees.

The implementation includes:
- Database indexes on employee number, department, status, employee name, and compensation lookup fields.
- Batch employee seeding with a configurable target count.
- Batch size of 500 for generated employee and initial compensation records.
- Pagination support where implemented by the employee listing API.
- Transactional compensation updates.

The employee seeder is disabled by default and can be enabled through application configuration.

The 10,000-employee target is a data-generation capability; production performance at that scale requires separate load testing.

## 7. Security and Data Integrity

- Passwords are stored as hashes using Spring Security's password encoder.
- JWT authentication protects authenticated API operations.
- Role-based authorization controls access to protected functionality.
- Environment variables are used for administrator credentials and database secrets.
- Request DTOs and validation protect incoming data.
- Compensation changes run within database transactions.
- Employee and compensation responses use DTOs instead of directly exposing persistence entities.

## 8. Architectural Trade-off

A modular monolith is appropriate for this assessment because the application has a focused business domain and a limited set of user roles.

It reduces deployment and infrastructure complexity while retaining clear module boundaries.

If the product grows, modules can be extracted into independent services when independent deployment or scaling becomes necessary.

## 9. Deployment Model

The application consists of:

- React frontend application.
- Spring Boot backend service.
- MySQL database.

The backend uses environment-based configuration for database credentials, JWT secrets, and administrator initialization.

The frontend and backend can be built independently using npm and the Maven Wrapper.