# PaySphere

Employee Salary Management Platform for ACME.

PaySphere is a web application designed to help HR teams manage employee information and compensation records through a secure interface.

## Technology Stack

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
- Vite 8
- JavaScript
- HTML and CSS

## Main Features

- Secure login with JWT authentication.
- Role-based access control for ADMIN, HR_MANAGER, and HR_STAFF.
- Employee management with search, filtering, and pagination.
- Compensation records and salary revision history.
- Salary revision access restricted to ADMIN and HR_MANAGER.
- Input validation and centralized backend security.
- Database-backed employee and compensation management.

## Prerequisites

Install the following:

- Java 21
- MySQL 8
- Node.js and npm
- Git

## Database Setup

1. Start MySQL.
2. Create a database named `paysphere_db`, or allow the application to create it.
3. Configure the database connection using environment variables.

The default JDBC URL in `application.properties` is:

`jdbc:mysql://localhost:3307/paysphere_db?createDatabaseIfNotExist=true`

Update the port if your MySQL server uses a different port.

## Environment Configuration

Configure these environment variables before starting the backend:

| Variable | Purpose |
|---|---|
| `DB_USERNAME` | MySQL username; defaults to `root` |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Base64-encoded JWT signing key |
| `ADMIN_USERNAME` | Initial administrator username |
| `ADMIN_EMAIL` | Initial administrator email |
| `ADMIN_PASSWORD` | Initial administrator password (minimum 12 characters) |
| `ADMIN_RESET_PASSWORD` | Optional; set to `true` to reset an existing administrator password |

Generate a Base64 JWT secret using PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Set the remaining environment variables in your PowerShell session. Enter passwords privately rather than storing them in source files.

Example:

```powershell
$env:DB_USERNAME = "root"
$secureDbPassword = Read-Host "MySQL password" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $secureDbPassword).Password
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_EMAIL = "admin@example.com"
$secureAdminPassword = Read-Host "Initial admin password" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $secureAdminPassword).Password
```

The administrator initializer creates an initial administrator when valid configuration is supplied and no matching account exists. It does not overwrite an existing administrator unless password reset is explicitly enabled.

Do not commit passwords, JWT secrets, or other credentials to Git.

## Run the Backend

Open a terminal:

```powershell
cd backend
.\mvnw.cmd clean compile
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Backend URL:

`http://localhost:8080`

Health endpoint:

`http://localhost:8080/actuator/health`

The backend requires a reachable MySQL database and the environment variables described above.

## Run the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally:

`http://localhost:5173`

The frontend communicates with the backend at `http://localhost:8080`. The backend CORS configuration permits the local Vite development origins.

## Production Build

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd backend
.\mvnw.cmd clean package
```

## Automated Tests

Run backend tests from the `backend` directory:

```powershell
.\mvnw.cmd test
```

A working MySQL connection and the required environment variables must be configured before running the Spring application-context tests.

## Project Structure

```text
PaySphere/
├── backend/
│   ├── src/main/java/com/paysphere/backend/
│   │   ├── compensation/
│   │   ├── employee/
│   │   ├── security/
│   │   └── seed/
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── REQUIREMENTS.md
└── README.md
```

## Scope

PaySphere focuses on employee information and compensation management.

Payroll disbursement, tax filing, attendance, recruitment, employee self-service, AI-based salary recommendations, and microservices are outside the current assessment scope.

## Author
Rohit Kute
