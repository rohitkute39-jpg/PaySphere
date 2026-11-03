# PaySphere — Architecture Design

## 1. Architecture Overview

PaySphere will use a modular monolithic architecture with a React frontend, a Spring Boot REST API and a MySQL relational database.

The application will be deployed as one backend service and one frontend application. Business responsibilities will be separated into modules to maintain clarity, testability and future extensibility.

## 2. Technology Choices

- Java 21 — LTS runtime.
- Spring Boot — backend application and REST APIs.
- Spring Data JPA and Hibernate — persistence.
- Spring Security and JWT — authentication and authorization.
- MySQL 8 — relational database.
- React — user interface.
- Material UI — reusable UI components.
- JUnit 5 and Mockito — backend testing.
- Vitest and React Testing Library — frontend testing.
- Maven Wrapper and npm — build tools.

## 3. Backend Modules

### Employee Module
Responsible for employee profiles, departments, designations, countries, employee status and employee search.

### Compensation Module
Responsible for salary records, compensation updates, allowances, bonuses, currencies and salary revision history.

### Analytics Module
Responsible for dashboard metrics, department-wise summaries, country-wise summaries and compensation reports.

### Security Module
Responsible for HR Manager authentication, JWT validation and access control.

### Reporting Module
Responsible for filtered report generation and CSV/Excel exports.

## 4. Database Design

The initial relational model will contain:

- `employees` — employee profile and employment information.
- `departments` — department master data.
- `countries` — country master data.
- `compensation_records` — salary and compensation details with effective dates.
- `users` — HR Manager login and authorization information.
- `salary_audit_logs` — salary change history, including previous and new values.

Salary amounts will use decimal precision rather than floating-point values. Every compensation record will retain its ISO currency code. Different currencies will not be added together or compared as if they were the same currency without an explicit exchange-rate policy.

## 5. API Design

The backend will expose REST endpoints for:

- Authentication.
- Employee creation, retrieval, update and deactivation.
- Employee search, filtering, sorting and pagination.
- Compensation creation and revision.
- Dashboard analytics.
- Salary reports and exports.

API responses will use consistent structures, validation and centralized exception handling.

## 6. Performance and Scalability

The initial target is 10,000 employee records.

The implementation will use:

- Database pagination rather than loading all employees at once.
- Indexes on frequently searched and filtered fields.
- Optimized aggregation queries for dashboard metrics.
- Appropriate transaction boundaries for salary updates.
- DTO projections to avoid unnecessary entity loading.
- Deterministic seed data for repeatable performance testing.

## 7. Security and Data Integrity

- Restrict salary information to authenticated and authorized HR users.
- Store password hashes rather than plaintext passwords.
- Validate all incoming data.
- Use database transactions for compensation changes and audit logging.
- Avoid exposing sensitive fields in unnecessary API responses.

## 8. Architectural Trade-off

A modular monolith is preferred over microservices for this assessment because the application has a focused business domain and a single primary user type.

This reduces deployment and infrastructure complexity while retaining clear module boundaries. If the product grows, individual modules can be extracted into services when independent scaling or deployment becomes a demonstrated need.

## 9. Initial Deployment Model

- React frontend application.
- One Spring Boot backend service.
- One MySQL database.
- Environment-based configuration for secrets and connection settings.

The final deployment will use environment variables for credentials and production configuration.