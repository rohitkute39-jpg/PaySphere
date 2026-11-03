# PaySphere — Database Design

## 1. Database Overview

PaySphere will use MySQL 8 as its relational database.

The schema is designed to support employee management, compensation records, historical salary changes, organizational reporting and secure HR access.

The initial target dataset is 10,000 employees.

## 2. Entity Relationship Design

### Departments
Stores organizational department information.

Fields:
- id — Primary key.
- name — Unique department name.
- description — Optional description.

Relationship: One department can have many employees.

### Countries
Stores country reference information.

Fields:
- id — Primary key.
- name — Country name.
- iso_code — Unique ISO country code.
- currency_code — Default ISO 4217 currency code.

Relationship: One country can have many employees.

### Employees
Stores employee profile information.

Fields:
- id — Primary key.
- employee_code — Unique employee identifier.
- first_name.
- last_name.
- email — Unique email address.
- department_id — Foreign key.
- country_id — Foreign key.
- designation.
- joining_date.
- employment_status.
- created_at.
- updated_at.

Relationships:
- Many employees belong to one department.
- Many employees belong to one country.
- One employee can have multiple compensation records.

### Compensation Records
Stores salary and compensation information over time.

Fields:
- id — Primary key.
- employee_id — Foreign key.
- base_salary — DECIMAL(15,2).
- allowances — DECIMAL(15,2).
- bonus — DECIMAL(15,2).
- currency_code — ISO 4217 currency code.
- effective_from — Compensation start date.
- effective_to — Compensation end date; NULL indicates the current record.
- created_at.

Historical compensation records will be retained instead of overwriting previous salary information.

### Users
Stores application login information.

Fields:
- id — Primary key.
- username — Unique username.
- password_hash — Secure password hash.
- role — Application role.
- enabled.
- created_at.

### Salary Audit Logs
Tracks compensation modifications.

Fields:
- id — Primary key.
- employee_id — Foreign key.
- compensation_record_id — Related compensation record.
- previous_salary — Previous base salary.
- new_salary — Updated base salary.
- changed_by — User who performed the change.
- change_reason — Optional reason.
- changed_at — Timestamp.

## 3. Relationships

- Department 1 → Many Employees.
- Country 1 → Many Employees.
- Employee 1 → Many Compensation Records.
- Employee 1 → Many Salary Audit Logs.
- User 1 → Many Salary Audit Logs.

## 4. Data Integrity Rules

- Employee codes and email addresses must be unique.
- Salary amounts must not be negative.
- Currency codes must contain valid three-letter ISO codes.
- Compensation effective dates must not overlap for the same employee.
- Only one current compensation record may exist per employee.
- Salary changes must preserve historical records.
- Compensation updates and audit logging must occur within a database transaction.

## 5. Indexing Strategy

Indexes will be created for frequently queried fields:

- employees.employee_code — Unique index.
- employees.email — Unique index.
- employees.department_id.
- employees.country_id.
- employees.employment_status.
- compensation_records.employee_id.
- compensation_records.effective_from.
- salary_audit_logs.employee_id.
- salary_audit_logs.changed_at.

Indexes will be validated against actual query patterns rather than added indiscriminately.

## 6. Salary and Currency Handling

Salary amounts will use DECIMAL(15,2) to avoid floating-point precision errors.

Each compensation record stores its own currency code.

Salary totals across different currencies will not be combined directly. Cross-currency reporting will require an explicit exchange-rate source and conversion date.

## 7. Performance Considerations

- Paginate employee listing endpoints.
- Filter records at database level.
- Use indexed columns for common searches.
- Use database aggregation for dashboard metrics.
- Avoid loading complete employee and salary histories unnecessarily.
- Use deterministic seed data to populate 10,000 employees.

## 8. Seed Data Strategy

The seed process will create:
- Department reference records.
- Country reference records.
- One HR Manager demo account.
- 10,000 deterministic employee records.
- Corresponding initial compensation records.

The seed process must be repeatable without creating duplicate employees or compensation records.

## 9. Design Trade-offs

Historical salary records are stored separately from employee profiles to preserve compensation history.

Currency is stored on each compensation record instead of assuming every employee is paid in the same currency.

The design prioritizes data integrity, traceability and reporting performance over unnecessary schema complexity.