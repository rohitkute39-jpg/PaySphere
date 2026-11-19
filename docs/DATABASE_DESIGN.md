## 9. Seed Data Strategy

The backend provides two independent startup initialization components.

### Administrator Initialization

`AdminUserInitializer` creates an initial administrator account when valid configuration is supplied through:
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

The password must contain at least 12 characters and is stored as a password hash using Spring Security's password encoder.

An existing administrator is not overwritten by default. Password reset requires `ADMIN_RESET_PASSWORD=true` and a matching email address.

### Employee and Compensation Seeding

`EmployeeDataSeeder` optionally generates employee and initial compensation records.

Configuration:
- `app.seed.employees.enabled` — Controls whether employee seeding runs; defaults to `false`.
- `app.seed.employees.target-count` — Target employee count; defaults to `10000`.

The seeder:
- Requires active departments to exist before it runs.
- Creates employees in batches of 500.
- Generates country codes and matching currency codes for sample data.
- Creates an initial compensation record for each generated employee.
- Checks existing employee numbers and email addresses to avoid duplicate generated records.
- Skips seeding when the existing employee count has already reached the configured target.

Department records are managed through the department module; no automatic department initialization component is currently implemented.

The employee seeder runs transactionally. The 10,000-employee configuration is a test-data capability, not a claim that every installation automatically contains 10,000 employees.