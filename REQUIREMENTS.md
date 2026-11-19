# PaySphere - Product Requirements Document

**Version:** 1.1
**Product:** Employee Salary Management Platform
**Primary User:** HR Manager / Administrator
**Organization:** ACME (10,000 employees)

## 1. Business Objective

PaySphere is a centralized web-based employee and compensation management platform designed to reduce reliance on spreadsheet-based employee and salary records.

It enables authorized HR users to maintain employee profiles, manage annual compensation records, and review salary revision history across multiple countries and currencies.

The assessment dataset target is 10,000 employees. Optional data seeding is provided for testing with larger datasets.

## 2. Scope and Core Features

### 2.1 Employee Management

Implemented capabilities:
- Create, view, and update employee records.
- Maintain employee number, name, email, phone, department, designation, country code, joining date, and employment status.
- Prevent duplicate employee numbers and email addresses.
- List employees using database pagination.
- Sort employee records by supported fields.
- Filter employees by employment status or department.
- Search employees by first name and last name.
- Validate employee and department information.

Current limitation:
- A dedicated employee deactivation endpoint is not exposed. Employment status can be updated through the employee update operation.

### 2.2 Department Management

Implemented capabilities:
- Create departments.
- Retrieve department details.
- List departments.
- Maintain department code, name, description, and active status.

### 2.3 Compensation Management

Implemented capabilities:
- Create annual compensation records.
- Maintain annual salary and three-character currency codes.
- Record effective start dates and revision reasons.
- Retrieve current compensation records.
- Retrieve an employee's compensation history.
- Preserve previous compensation records when a revision is created.
- Validate salary revision dates and salary inputs.

Current limitations:
- Allowances and bonuses are not separate compensation components.
- Compensation history is maintained in the compensation records table rather than a separate audit-log table.

### 2.4 Dashboard

The React application provides a dashboard interface for HR users.

Backend analytics capabilities such as department-wise and country-wise salary aggregation are not included in the currently verified REST controller endpoints.

Advanced analytics and comparative reporting remain future enhancements.

### 2.5 Security and Access Control

Implemented capabilities:
- Administrator authentication through a login endpoint.
- JWT-based authentication.
- Role-based authorization.
- Password hashing using Spring Security's password encoder.
- Environment-based administrator initialization.
- Protected access to compensation functionality.

Current limitation:
- A separate salary audit log containing the previous value, new value, and acting user's identity is not implemented.

## 3. Non-Functional Requirements

- Target an initial dataset of 10,000 employees.
- Use database indexes for frequently accessed employee and compensation fields.
- Support database pagination for employee listing.
- Maintain separation between frontend, backend, and database layers.
- Provide request validation and centralized exception handling.
- Include automated backend and frontend tests.
- Support optional repeatable sample-data generation.
- Maintain readable, modular, and documented code.

The employee seeder is disabled by default and supports a configurable target count and batch size.

## 4. Technology Stack

- Backend: Java 21, Spring Boot
- Frontend: React 19, JavaScript, Vite, HTML, and CSS
- Database: MySQL 8
- ORM and Persistence: Spring Data JPA, Hibernate
- Security: Spring Security, JWT, password hashing
- API: RESTful APIs with JSON
- Backend Testing: JUnit and Mockito
- Frontend Testing: Vitest and React Testing Library
- Build Tools: Maven Wrapper and npm
- Version Control: Git and GitHub

## 5. Out of Scope

- Payroll disbursement and payment processing.
- Tax calculation and statutory filing.
- Attendance and leave management.
- Recruitment and applicant tracking.
- Employee self-service portal.
- AI-based salary recommendations.
- Microservices architecture.

## 6. Future Enhancements

The following capabilities are potential extensions and are not represented as completed features in the current implementation:

- Advanced dashboard analytics and salary distribution charts.
- CSV and Excel report generation.
- Combined employee search and filter criteria.
- Dedicated employee deactivation operation.
- Separate salary audit events with user attribution.
- Separate allowances and bonus components.
- Performance and load testing against the 10,000-employee target.