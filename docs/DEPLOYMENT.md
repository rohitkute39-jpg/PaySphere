# PaySphere Deployment Guide

## 1. Overview

PaySphere is an Employee Salary Management Platform built using React, Spring Boot, and MySQL.

The application follows a modular monolith architecture with a separate frontend and backend.

## 2. Prerequisites

Install the following software:

| Software | Version |
|---|---|
| Java JDK | 21 |
| MySQL Server | 8.x |
| Node.js | Compatible with Vite 8 |
| npm | Compatible with installed Node.js |
| Git | Latest stable version |

Verify installations:

```bash
java -version
node -v
npm -v
git --version
```

## 3. Clone the Repository

```bash
git clone https://github.com/rohitkute39-jpg/PaySphere.git
cd PaySphere
```

## 4. Database Configuration

1. Start the MySQL server.
2. Create the application database:

```sql
CREATE DATABASE paysphere_db;
```

3. Configure the database connection in:

`backend/src/main/resources/application.properties`

The application uses these connection settings:

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/paysphere_db?createDatabaseIfNotExist=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

Update the host, port, username, and credentials according to your local MySQL installation. Never commit database passwords or other sensitive credentials.
## 5. Environment Variables

Configure the required environment variables before starting the backend.

| Variable | Purpose |
|---|---|
| DB_USERNAME | MySQL username |
| DB_PASSWORD | MySQL password |
| JWT_SECRET | Secret key used for JWT signing |
| ADMIN_USERNAME | Initial administrator username |
| ADMIN_EMAIL | Initial administrator email |
| ADMIN_PASSWORD | Initial administrator password |
| ADMIN_RESET_PASSWORD | Controls whether an existing administrator password can be reset |

Use secure values for production. Do not store real credentials in source code or commit them to Git.

## 6. Backend Setup and Startup

Open a terminal in the project root and navigate to the backend:

```powershell
cd backend
```

Run backend tests:

```powershell
.\mvnw.cmd clean test
```

Start the Spring Boot application:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend base URL:

`http://localhost:8080`

Health check:

`http://localhost:8080/actuator/health`

## 7. Frontend Setup and Startup

Open another terminal from the project root:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the frontend in your browser:

`http://localhost:5173`

If port 5173 is already occupied, Vite may select another available port. Use the URL displayed in the terminal.
## 8. Optional Employee Sample Data

Employee sample data seeding is disabled by default.

To enable it, configure:

```properties
app.seed.employees.enabled=true
app.seed.employees.target-count=10000
```

The seeder requires active departments and checks for existing employee records before creating data. It uses batches of 500 and creates initial compensation records for seeded employees.

Enable sample data generation only when required for development or demonstration. Do not enable it unintentionally in production.

## 9. Verification

### Backend tests

```powershell
.\mvnw.cmd test
```

### Frontend tests

```powershell
npm.cmd test
```

### Frontend production build

```powershell
npm.cmd run build
```

### Frontend lint

```powershell
npm.cmd run lint
```

### Backend health

Open:

`http://localhost:8080/actuator/health`

A healthy application should return a status of `UP`.

## 10. Production Build

Create a production frontend build:

```powershell
cd frontend
npm.cmd run build
```

The generated frontend files are available in:

`frontend/dist`

Build the backend JAR:

```powershell
cd ..\backend
.\mvnw.cmd clean package
```

The generated JAR is available in:

`backend/target`

## 11. Security Considerations

- Passwords are stored using password hashing.
- API access is protected using JWT authentication and role-based authorization.
- Database credentials and JWT secrets must be supplied through environment variables.
- Do not commit `.env` files, passwords, tokens, or other secrets.
- Use HTTPS in production.
- Restrict database access to trusted application hosts.

## 12. Repository

GitHub repository:

https://github.com/rohitkute39-jpg/PaySphere