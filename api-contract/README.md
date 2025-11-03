# TRACKSY API Contract

This directory contains the OpenAPI 3.0 specification for the TRACKSY Smart Student Transport Tracking System API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0 specification with all API endpoints

## API Overview

The TRACKSY API is organized into the following main sections:

### Authentication Endpoints
- User login, registration, logout
- Password reset functionality
- Token refresh

### Student Endpoints
- Bus tracking and location
- Route information
- Seat availability and booking
- Booking management

### Driver Endpoints
- Trip management (start/end)
- Location updates
- Route navigation
- Passenger check-in
- Emergency alerts and incident reporting

### Admin Endpoints
- Bus management (CRUD operations)
- Route management (CRUD operations)
- Stop management
- User management (Students, Drivers, Admins)
- Analytics and reporting
- System monitoring

## Using the API Contract

### View Documentation

You can view the API documentation using:

1. **Swagger UI**: Visit https://editor.swagger.io/ and paste the contents of `openapi.yaml`
2. **Redoc**: Use Redoc to generate beautiful documentation
3. **Postman**: Import the OpenAPI file into Postman

### Generate Client Code

Generate client SDKs for different languages:

```bash
# Using OpenAPI Generator
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o ./generated/typescript-client

openapi-generator-cli generate \
  -i openapi.yaml \
  -g javascript \
  -o ./generated/javascript-client

openapi-generator-cli generate \
  -i openapi.yaml \
  -g php \
  -o ./generated/php-client
```

### Validate the Contract

```bash
# Using Swagger CLI
swagger-cli validate openapi.yaml

# Or using Redocly CLI
redocly lint openapi.yaml
```

## API Base URLs

- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.tracksy.com/api`

## Authentication

All endpoints (except login and registration) require Bearer token authentication:

```
Authorization: Bearer <your_jwt_token>
```

## WebSocket Channels

The API also supports WebSocket connections for real-time updates:

- `bus.{busId}.location` - Real-time bus location updates
- `bus.{busId}.deviation` - Route deviation alerts
- `user.{userId}.notifications` - User-specific notifications
- `driver.{driverId}.messages` - Driver-specific messages
- `driver.{driverId}.route-updates` - Route change notifications
- `admin.dashboard` - Real-time dashboard updates
- `admin.buses` - Bus status updates
- `admin.alerts` - Alert notifications

## Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API rate limits (to be configured):
- Authenticated requests: 1000 requests per hour
- Unauthenticated requests: 100 requests per hour

## Versioning

Current API version: **v1.0.0**

API versioning will be implemented through URL path (e.g., `/api/v1/...`)

## Contact

For API questions or issues, contact: support@tracksy.com

---

**Last Updated**: 2024  
**API Version**: 1.0.0

