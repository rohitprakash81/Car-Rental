# Car Rental API Backend

A production-grade, enterprise-ready **Car Rental Management System REST API** built with **Spring Boot 3.5**, **Java 21**, **Spring Data JPA**, **Spring Security (Stateless JWT + RTR)**, **MySQL**, **MapStruct**, **Sliding Window Rate Limiter**, **Razorpay Payments**, **Cloudinary Media Storage**, and **Jakarta Mail (Async SMTP)**.

The application supports three distinct roles:
- **Super Admin** – oversees fleet verification, owner KYC documents, platform analytics, and account safety suspension.
- **Car Owner** – registers, verifies KYC, lists vehicles, views booking requests, and accepts/rejects with ACID concurrency locks.
- **Customer** – browses approved catalog, submits reservation requests, and completes secure Razorpay payments.

Authentication is **100% Stateless** via secure HttpOnly cookies with Refresh Token Rotation (RTR). Embedded Tomcat session tracking (`JSESSIONID`) is completely disabled.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Database](#database)
- [Sliding Window Rate Limiting](#sliding-window-rate-limiting)
- [Configuration](#configuration)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Base URL](#api-base-url)
- [API Endpoints](#api-endpoints)
  - [Authentication & Sessions](#authentication--sessions)
  - [Super Admin Governance](#super-admin-governance)
  - [Car Owner APIs](#car-owner-apis)
  - [Customer APIs](#customer-apis)
  - [Razorpay Payments](#razorpay-payments)
- [Postman Collection](#postman-collection)
- [Booking Workflow](#booking-workflow)
- [Car and Booking Statuses](#car-and-booking-statuses)
- [Validation Rules](#validation-rules)
- [Security](#security)
- [Email Notifications](#email-notifications)
- [Exception Handling](#exception-handling)

---

## Features

### Authentication & Token Security
- Multi-role authentication (Super Admin, Car Owner, Customer)
- **100% Stateless Zero-Session Architecture**: No `JSESSIONID` cookies generated or tracked.
- **HttpOnly Secure Cookies**: Defense-in-depth against XSS token theft.
- **Refresh Token Rotation (RTR)**: Automatic rotation on refresh with token family invalidation on reuse.
- **Token Blacklisting**: Revocation upon logout and instant administrative account lock.
- BCrypt password hashing (strength 10).

### Sliding Window Rate Limiter
- Thread-safe sliding window log algorithm tracking timestamps per `category:clientIp`.
- Automatic expired window purging to prevent memory leaks.
- Enforces strict thresholds:
  - Auth: 5 requests / minute
  - Payments: 10 requests / minute
  - Bookings: 15 requests / minute
  - General: 100 requests / minute
- Returns **HTTP 429 Too Many Requests** with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After`.

### Car Owner

- Register a new car
- View all cars
- View car-owner profile/session status
- Logout
- View pending booking requests
- Accept or reject booking requests

### Customer

- View cars
- Book a car
- Booking requests are initially created with `PENDING` status
- Session-based customer login

### Booking

- Customer creates a booking request
- Car changes from `AVAILABLE` to `PENDING`
- Car owner receives an email notification
- Car owner can accept or reject the request
- Accepted booking changes the car status to `OCCUPIED`
- Rejected booking changes the car status back to `AVAILABLE`
- Customer receives an email after the booking status is processed

### Other

- DTO-based API design
- MapStruct entity/DTO mapping
- Jakarta Bean Validation
- Centralized exception handling
- MySQL persistence with Hibernate/JPA
- Springdoc OpenAPI / Swagger UI support
- Unit testing with JUnit and Mockito

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Java 21 | Programming language |
| Spring Boot 4.1.1 | Application framework |
| Spring Web MVC | REST APIs |
| Spring Data JPA | Database persistence |
| Hibernate | ORM |
| MySQL | Primary database |
| Spring Security | API security configuration |
| BCrypt | Password hashing |
| Spring Validation | Request validation |
| Spring Mail | Email notifications |
| MapStruct 1.6.3 | DTO/entity mapping |
| Lombok | Boilerplate reduction |
| Springdoc OpenAPI 3.1.0 | API documentation |
| JUnit 5 | Testing |
| Mockito | Mock-based unit testing |
| Maven | Build and dependency management |

---

## Project Architecture

The project follows a layered Spring Boot architecture:

```text
Client
  |
  v
REST Controllers
  |
  v
Service Layer
  |
  +----> Mapper Layer
  |
  v
Repository Layer
  |
  v
MySQL Database
```

Supporting components include:

```text
Security Configuration
Exception Handler
Email Service
DTOs
Entities
Enums
```

### Main layers

**Controller**

Handles HTTP requests and responses.

**Service**

Contains application/business logic such as registration, login, car registration, and booking processing.

**Repository**

Uses Spring Data JPA to communicate with the database.

**Entity**

Represents persistent database objects.

**DTO**

Defines request and response models exposed through the REST API.

**Mapper**

Uses MapStruct to convert between DTOs and entities.

---

## Project Structure

```text
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── rohit/
│   │           └── car_rental_api_spring_boot_project/
│   │               ├── config/
│   │               │   └── CarRentalSecurityConfig.java
│   │               │
│   │               ├── controller/
│   │               │   ├── AuthController.java
│   │               │   ├── CarOwnerController.java
│   │               │   └── CustomerController.java
│   │               │
│   │               ├── dto/
│   │               │   ├── BookingRequestDTO.java
│   │               │   ├── BookingResponseDTO.java
│   │               │   ├── CarOwnerRequestDTO.java
│   │               │   ├── CarOwnerResponseDTO.java
│   │               │   ├── CarRequestDTO.java
│   │               │   ├── CarResponseDTO.java
│   │               │   ├── CustomerRequestDTO.java
│   │               │   ├── CustomerResponseDTO.java
│   │               │   └── LoginRequestDTO.java
│   │               │
│   │               ├── entity/
│   │               │   ├── Booking.java
│   │               │   ├── Car.java
│   │               │   ├── CarAvailability.java
│   │               │   ├── CarCategory.java
│   │               │   ├── CarOwner.java
│   │               │   ├── Customer.java
│   │               │   ├── Notification.java
│   │               │   ├── Payment.java
│   │               │   ├── Role.java
│   │               │   └── WhatsappNotification.java
│   │               │
│   │               ├── enums/
│   │               │   ├── BookingStatus.java
│   │               │   └── CarStatus.java
│   │               │
│   │               ├── exception/
│   │               │   ├── CarRentalApiExceptionHandler.java
│   │               │   ├── EmailAllreadyExistException.java
│   │               │   ├── ErrorResponse.java
│   │               │   ├── InvalidEmailException.java
│   │               │   ├── InvalidPasswordException.java
│   │               │   └── RoleNotFoundException.java
│   │               │
│   │               ├── mail/
│   │               │   └── CarRentalEmailService.java
│   │               │
│   │               ├── mapper/
│   │               │   ├── BookingMapper.java
│   │               │   ├── CarMapper.java
│   │               │   ├── CarOwnerMapper.java
│   │               │   └── CustomerMapper.java
│   │               │
│   │               ├── repository/
│   │               │   ├── BookingRepository.java
│   │               │   ├── CarOwnerRepository.java
│   │               │   ├── CarRepository.java
│   │               │   ├── CustomerRepository.java
│   │               │   └── RoleRepository.java
│   │               │
│   │               └── service/
│   │                   ├── BookingService.java
│   │                   ├── CarOwnerService.java
│   │                   ├── CarService.java
│   │                   ├── CustomerService.java
│   │                   └── RoleService.java
│   │
│   └── resources/
│       └── application.properties
│
└── test/
    └── java/
        └── com/rohit/car_rental_api_spring_boot_project/
```

---

## Database

The current application is configured for MySQL.

Default database configuration in the project is:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/car-rental-api
spring.datasource.username=root
spring.datasource.password=root
```

Create the database before starting the application:

```sql
CREATE DATABASE `car-rental-api`;
```

Hibernate is configured to update the schema automatically:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For production systems, use migrations such as **Flyway** or **Liquibase** instead of relying on `ddl-auto=update`.

---

## Configuration

The application is configured to run on port **1571**:

```properties
server.port=1571
```

Therefore the default application URL is:

```text
http://localhost:1571
```

### Recommended configuration

Do not store database or SMTP passwords directly in source control.

A safer configuration is:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

Example environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/car-rental-api
DB_USERNAME=root
DB_PASSWORD=your_database_password

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_app_password
```

For Gmail SMTP, use a Gmail **App Password** rather than your normal account password.

---

## Prerequisites

Install the following before running the project:

1. Java 21
2. Maven 3.9+ or use the included Maven Wrapper
3. MySQL 8+
4. Git
5. An IDE such as IntelliJ IDEA, Eclipse, or Spring Tool Suite

Verify Java:

```bash
java -version
```

Verify Maven:

```bash
mvn -version
```

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

### 2. Enter the project directory

```bash
cd car-rental-api-backend-spring-boot-main
```

### 3. Create the MySQL database

```sql
CREATE DATABASE `car-rental-api`;
```

### 4. Configure database credentials

Update `src/main/resources/application.properties`, or preferably use environment variables.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/car-rental-api
spring.datasource.username=root
spring.datasource.password=your_password
```

### 5. Configure email

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@example.com
spring.mail.password=your_gmail_app_password

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 6. Build the project

Using Maven:

```bash
mvn clean install
```

Or using the Maven Wrapper:

Linux/macOS:

```bash
./mvnw clean install
```

Windows:

```cmd
mvnw.cmd clean install
```

---

## Running the Application

### Maven

```bash
mvn spring-boot:run
```

### Maven Wrapper

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows:

```cmd
mvnw.cmd spring-boot:run
```

### Run the packaged JAR

```bash
java -jar target/car-rental-api-spring-boot-project-0.0.1-SNAPSHOT.jar
```

The application will be available at:

```text
http://localhost:1571
```

---

# API Base URL

```text
http://localhost:1571/api/v1
```

---

# API Endpoints

## Authentication

Base path:

```text
/api/v1/auth
```

### Register Car Owner

```http
POST /api/v1/auth/registerCarOwner
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "Gurugram, Haryana",
  "phoneNumber": "9876543210",
  "licenseNumber": "DL123456789"
}
```

Response:

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "address": "Gurugram, Haryana",
  "phoneNumber": "9876543210",
  "licenseNumber": "DL123456789"
}
```

The password is encoded with BCrypt and is not included in the response DTO.

---

### Register Customer

```http
POST /api/v1/auth/registerCustomer
```

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phoneNumber": "9876543210",
  "address": "Delhi, India"
}
```

---

### Car Owner Login

```http
POST /api/v1/auth/loginCarOwner
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful login creates the session attribute:

```text
carOwnerSession
```

---

### Customer Login

```http
POST /api/v1/auth/loginCustomer
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Successful login creates the session attribute:

```text
customerSession
```

---

### Save Role

```http
POST /api/v1/auth/saveRole
```

Example:

```json
{
  "name": "Role_Customer"
}
```

The application expects these roles during registration:

```text
Role_Customer
Role_CarOwner
```

---

# Car Owner APIs

Base path:

```text
/api/v1/carOwner
```

## Register Car

```http
POST /api/v1/carOwner/registerCar
```

A car owner must be logged in.

Request:

```json
{
  "vehicleNumber": "HR26AB1234",
  "brand": "Toyota",
  "model": "Innova Crysta",
  "fuelType": "Diesel",
  "seatingCapacity": 7,
  "pricePerDay": 2500,
  "pricePerKm": 15
}
```

The newly registered car starts with:

```text
AVAILABLE
```

---

## Get All Cars

```http
GET /api/v1/carOwner/getAllCars
```

The endpoint requires a car-owner session.

---

## Car Owner Profile

```http
GET /api/v1/carOwner/carOwnerProfile
```

This endpoint currently returns a basic success message when the owner is logged in.

---

## Logout Car Owner

```http
GET /api/v1/carOwner/logoutCarOwner
```

Invalidates the HTTP session.

---

## Get Pending Bookings

```http
GET /api/v1/carOwner/getPendingBookingForCarOwner
```

Returns pending booking requests associated with cars owned by the logged-in car owner.

---

## Accept or Reject Booking

```http
POST /api/v1/carOwner/confirmedOrRejectBookingStatus/{bookingId}/{status}
```

Example:

```http
POST /api/v1/carOwner/confirmedOrRejectBookingStatus/8521/ACCEPTED
```

or:

```http
POST /api/v1/carOwner/confirmedOrRejectBookingStatus/8521/REJECTED
```

Supported booking statuses include:

```text
PENDING
ACCEPTED
REJECTED
COMPLETED
```

When accepted:

```text
Booking -> ACCEPTED
Car     -> OCCUPIED
```

When rejected:

```text
Booking -> REJECTED
Car     -> AVAILABLE
```

---

# Customer APIs

Base path:

```text
/api/v1/customer
```

## Get All Cars

```http
GET /api/v1/customer/getAllCars
```

Requires a logged-in customer session.

---

## Book a Car

```http
POST /api/v1/customer/bookCar/{carId}
```

Example:

```http
POST /api/v1/customer/bookCar/9001
```

Request body:

```json
{
  "journeyDate": "2026-10-15",
  "source": "Gurugram",
  "destination": "Jaipur"
}
```

A successful booking:

1. Creates a booking.
2. Sets booking status to `PENDING`.
3. Changes the car status to `PENDING`.
4. Sends an email to the car owner.

---

# Request Examples

## Complete Registration Flow

### Step 1 – Create Car Owner Role

```http
POST /api/v1/auth/saveRole
Content-Type: application/json
```

```json
{
  "name": "Role_CarOwner"
}
```

### Step 2 – Create Customer Role

```http
POST /api/v1/auth/saveRole
Content-Type: application/json
```

```json
{
  "name": "Role_Customer"
}
```

### Step 3 – Register Car Owner

```http
POST /api/v1/auth/registerCarOwner
Content-Type: application/json
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "address": "Gurugram",
  "phoneNumber": "9876543210",
  "licenseNumber": "DL12345678"
}
```

### Step 4 – Register Customer

```http
POST /api/v1/auth/registerCustomer
Content-Type: application/json
```

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phoneNumber": "9876543211",
  "address": "Delhi"
}
```

### Step 5 – Car Owner Login

```http
POST /api/v1/auth/loginCarOwner
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Step 6 – Register a Car

```http
POST /api/v1/carOwner/registerCar
Content-Type: application/json
```

```json
{
  "vehicleNumber": "HR26AB1234",
  "brand": "Toyota",
  "model": "Innova Crysta",
  "fuelType": "Diesel",
  "seatingCapacity": 7,
  "pricePerDay": 2500,
  "pricePerKm": 15
}
```

### Step 7 – Customer Login

```http
POST /api/v1/auth/loginCustomer
Content-Type: application/json
```

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Step 8 – Book the Car

```http
POST /api/v1/customer/bookCar/9001
Content-Type: application/json
```

```json
{
  "journeyDate": "2026-10-15",
  "source": "Gurugram",
  "destination": "Jaipur"
}
```

### Step 9 – Car Owner Reviews Booking

```http
GET /api/v1/carOwner/getPendingBookingForCarOwner
```

### Step 10 – Accept Booking

```http
POST /api/v1/carOwner/confirmedOrRejectBookingStatus/8521/ACCEPTED
```

---

# Booking Workflow

The current booking lifecycle is:

```text
Customer
   |
   | Book car
   v
PENDING
   |
   +-------------------+
   |                   |
   v                   v
ACCEPTED             REJECTED
   |                   |
   v                   v
OCCUPIED             AVAILABLE
```

Detailed flow:

```text
1. Customer logs in
        |
        v
2. Customer selects a car
        |
        v
3. Customer submits booking
        |
        v
4. Booking created with PENDING status
        |
        v
5. Car becomes PENDING
        |
        v
6. Email sent to car owner
        |
        v
7. Car owner accepts/rejects
        |
        +---- ACCEPTED ---> Car becomes OCCUPIED
        |
        +---- REJECTED ---> Car becomes AVAILABLE
```

---

# Car and Booking Statuses

## CarStatus

Defined in:

```text
CarStatus.java
```

Values:

| Status | Meaning |
|---|---|
| `AVAILABLE` | Car can be booked |
| `PENDING` | Car currently has a pending booking request |
| `OCCUPIED` | Booking has been accepted and car is occupied |

## BookingStatus

Defined in:

```text
BookingStatus.java
```

Values:

| Status | Meaning |
|---|---|
| `PENDING` | Waiting for owner approval |
| `ACCEPTED` | Owner accepted the booking |
| `REJECTED` | Owner rejected the booking |
| `COMPLETED` | Booking has been completed |

---

# Validation Rules

## Car Owner Registration

| Field | Rule |
|---|---|
| `name` | Required, 2–50 characters |
| `email` | Required, valid email |
| `password` | Required, 8–100 characters |
| `address` | Required, maximum 255 characters |
| `phoneNumber` | Required, valid 10-digit Indian mobile number |
| `licenseNumber` | Required, 5–30 characters |

Indian phone number validation:

```text
^[6-9]\d{9}$
```

---

## Customer Registration

| Field | Rule |
|---|---|
| `name` | Required |
| `email` | Required, valid email |
| `password` | Required, minimum 8 characters |
| `phoneNumber` | Required, valid 10-digit Indian mobile number |
| `address` | Optional |

---

## Car Registration

| Field | Rule |
|---|---|
| `vehicleNumber` | Required |
| `brand` | Required |
| `model` | Required |
| `fuelType` | Required |
| `seatingCapacity` | Required, minimum 1 |
| `pricePerDay` | Required, must be positive |
| `pricePerKm` | Required, must be positive |

---

## Booking

`journeyDate` must be today or a future date:

```text
@FutureOrPresent
```

Example:

```json
{
  "journeyDate": "2026-10-15",
  "source": "Delhi",
  "destination": "Agra"
}
```

---

# Security

The application uses Spring Security.

Password storage uses:

```java
BCryptPasswordEncoder
```

The current security configuration disables CSRF and enables HTTP Basic authentication:

```text
/api/v1/auth/**       -> permitted
/api/v1/carOwner/**   -> permitted
/api/v1/customer/**   -> permitted
/api/v1/admin/**      -> ADMIN role
other endpoints       -> authenticated
```

Application-level login state is additionally tracked using HTTP session attributes:

```text
carOwnerSession
customerSession
```

### Important

Although the security configuration currently permits the car-owner and customer URL patterns at the Spring Security filter level, the controllers/services themselves check session attributes before performing many operations.

For production, authentication and authorization should be tightened so protected endpoints cannot be accessed without a valid authenticated user/session.

---

# Email Notifications

The project contains:

```text
CarRentalEmailService
```

Two email notifications are currently implemented.

## Booking Request Email

When a customer books a car, an email is sent to the car owner.

The email contains:

- Customer name
- Vehicle number
- Booking request notification

## Booking Confirmation Email

When the car owner processes the booking, an email is sent to the customer.

The email contains:

- Customer name
- Vehicle number
- Booking confirmation message

SMTP is configured for Gmail on port `587` with STARTTLS.

---

# Exception Handling

The application contains a centralized exception handler:

```text
CarRentalApiExceptionHandler
```

Custom exceptions include:

```text
EmailAllreadyExistException
InvalidEmailException
InvalidPasswordException
RoleNotFoundException
```

Examples of handled business errors include:

- Duplicate email registration
- Invalid login email
- Invalid password
- Missing role
- Missing car
- Missing booking
- Missing session/login

---

# Testing

The project includes JUnit and Mockito tests.

Example test class:

```text
CarOwnerServiceTest
```

The test suite covers scenarios such as:

- Successful car-owner registration
- Duplicate car-owner email
- Repository interactions
- Password encoding
- DTO/entity mapping

Run tests with:

```bash
mvn test
```

Or:

```bash
./mvnw test
```

On Windows:

```cmd
mvnw.cmd test
```

### Note

The source currently contains a test method named `test()` in `CarOwnerServiceTest` that calls:

```java
fail("Not yet implemented");
```

Therefore, the full test suite may fail until that placeholder test is removed or implemented.

---

# Swagger / OpenAPI & Postman Collection

The project includes:

```text
springdoc-openapi-starter-webmvc-ui
```

After starting the application, Swagger UI is normally available at:

```text
http://localhost:1571/swagger-ui/index.html
```

OpenAPI JSON is normally available at:

```text
http://localhost:1571/v3/api-docs
```

### Postman Collection

A complete Postman Collection file is available in the root directory:

```text
car-rental-api.postman_collection.json
```

You can import this file directly into Postman to test all endpoints.

---

# Maven Commands

### Clean project

```bash
mvn clean
```

### Compile

```bash
mvn compile
```

### Run tests

```bash
mvn test
```

### Package

```bash
mvn package
```

### Install

```bash
mvn clean install
```

### Run application

```bash
mvn spring-boot:run
```

### Skip tests while packaging

```bash
mvn clean package -DskipTests
```

---

# Troubleshooting

## 1. MySQL connection failed

Check:

```properties
spring.datasource.url
spring.datasource.username
spring.datasource.password
```

Make sure MySQL is running.

Check that the database exists:

```sql
SHOW DATABASES;
```

Create it if necessary:

```sql
CREATE DATABASE `car-rental-api`;
```

---

## 2. Application port already in use

The application uses port `1571`.

If another process is using it, change:

```properties
server.port=1571
```

For example:

```properties
server.port=8080
```

---

## 3. Role not found during registration

The application expects:

```text
Role_CarOwner
Role_Customer
```

Create them before registering users.

Example:

```http
POST /api/v1/auth/saveRole
```

```json
{
  "name": "Role_CarOwner"
}
```

and:

```json
{
  "name": "Role_Customer"
}
```

---

## 4. Email is not being sent

Verify:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@example.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

For Gmail, use an App Password when required.

Also verify that the SMTP account is allowed to send mail and that the credentials are correct.

---

## 5. Booking endpoint says user is not logged in

The application uses HTTP session attributes.

Customer booking requires:

```text
customerSession
```

Car-owner operations require:

```text
carOwnerSession
```

Make sure the client preserves the session cookie between login and subsequent requests.

For browser/API clients, verify that the session cookie is retained.

---

## 6. MapStruct implementation is missing

Run:

```bash
mvn clean compile
```

MapStruct implementations are generated during compilation.

Do not manually edit generated files under:

```text
target/generated-sources/
```

---

# Important Security Notes

## Never commit secrets

The original project configuration contains database/SMTP credentials in `application.properties`.

**Do not commit real credentials to GitHub or another public repository.**

Move secrets to environment variables or a secret manager.

Recommended:

```properties
spring.datasource.password=${DB_PASSWORD}
spring.mail.password=${MAIL_PASSWORD}
```

If credentials have already been exposed in a repository, rotate them immediately.

## Additional production recommendations

Before deploying this application publicly:

- Use environment variables/secrets management.
- Rotate any credentials previously committed to source control.
- Use HTTPS.
- Enable appropriate CSRF protection where browser sessions require it.
- Restrict protected endpoints.
- Implement proper role-based authorization.
- Validate that a car owner owns a booking before allowing status changes.
- Prevent customers from booking unavailable cars.
- Add authorization checks to every sensitive operation.
- Use database migrations.
- Avoid returning entities directly from REST APIs.
- Add structured error responses.
- Add logging and monitoring.
- Add rate limiting for authentication endpoints.
- Add stronger session management.
- Configure secure cookie attributes such as `HttpOnly`, `Secure`, and an appropriate `SameSite` policy.
- Avoid exposing SQL logs in production.

---

# Current Limitations / Areas for Improvement

The current codebase provides the foundation for a car-rental backend, but several areas can be expanded.

### Customer booking history

A customer endpoint for confirmed/past bookings is not currently implemented:

```java
public ResponseEntity<?> getConfirmedBookingStatus(){
    return null;
}
```

A future implementation should provide booking history and status for the logged-in customer.

### Authorization

The security configuration currently permits:

```text
/api/v1/carOwner/**
/api/v1/customer/**
```

Spring Security authorization should be tightened so only the correct authenticated user can access each operation.

### Booking ownership validation

Before accepting/rejecting a booking, the backend should verify that the logged-in car owner actually owns the car associated with the booking.

### Car availability validation

The booking flow should explicitly reject booking attempts for cars that are not currently `AVAILABLE`.

### Payment

Payment-related entities exist in the project, but a complete payment workflow is not currently exposed through REST APIs.

### Notifications

Notification-related entities exist, but the current implemented notification flow primarily uses email.

### Admin APIs

The security configuration references:

```text
/api/v1/admin/**
```

with `ADMIN` role protection, but an admin controller is not currently present in the source structure.

---

# Recommended Production Architecture

For a production-grade version, the system can evolve toward:

```text
                    +-------------------+
                    |    Frontend/UI    |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |   REST API Layer  |
                    +---------+---------+
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
        Authentication    Car Service    Booking Service
              |               |               |
              +---------------+---------------+
                              |
                              v
                    +-------------------+
                    | Repository / JPA  |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |      MySQL        |
                    +-------------------+

                              |
                              v
                    +-------------------+
                    | Notification/SMTP |
                    +-------------------+
```

Potential additions:

- JWT/OAuth2 authentication
- Admin dashboard
- Payment gateway
- Car search/filtering
- Pagination
- Booking cancellation
- Booking history
- Reviews and ratings
- Image upload for cars
- Location-based search
- Availability calendar
- Automated booking completion
- WhatsApp notifications
- Redis caching
- Docker deployment
- CI/CD pipeline

---

# Git Workflow

A typical development workflow:

```bash
git status
git add .
git commit -m "Add car rental API changes"
git push
```

Before pushing:

```bash
mvn clean test
```

Make sure secrets and generated build artifacts are not committed.

Recommended `.gitignore` entries include:

```text
target/
.idea/
*.iml
.env
application-local.properties
```

---

# Example cURL Requests

## Register Customer

```bash
curl -X POST "http://localhost:1571/api/v1/auth/registerCustomer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "phoneNumber": "9876543210",
    "address": "Delhi"
  }'
```

## Customer Login

```bash
curl -X POST "http://localhost:1571/api/v1/auth/loginCustomer" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

## Get Cars

```bash
curl -X GET "http://localhost:1571/api/v1/customer/getAllCars" \
  -b cookies.txt
```

## Book a Car

```bash
curl -X POST "http://localhost:1571/api/v1/customer/bookCar/9001" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "journeyDate": "2026-10-15",
    "source": "Gurugram",
    "destination": "Jaipur"
  }'
```

---

# License

No license file is currently defined in the project.

If this project will be distributed publicly, add an appropriate license such as:

```text
MIT
Apache-2.0
GPL-3.0
```

and include the corresponding `LICENSE` file.

---

# Author

**Rohit Prakash**

Car Rental API Backend — Spring Boot Project.

---

## Summary

This project provides a Spring Boot backend for a car rental platform with:

- Car owner management
- Customer management
- Authentication
- Session-based login
- Car registration
- Car listing
- Car booking
- Booking approval/rejection
- Car availability states
- Email notifications
- MySQL persistence
- JPA/Hibernate
- Spring Security
- MapStruct
- Bean Validation
- JUnit/Mockito testing
- Swagger/OpenAPI support

The main API starts on:

```text
http://localhost:1571
```

with API endpoints under:

```text
/api/v1
```
