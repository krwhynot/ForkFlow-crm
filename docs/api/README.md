# ForkFlow CRM API Documentation

This directory contains OpenAPI/Swagger specifications for the ForkFlow CRM APIs.

## API Specifications

### Interactions API
- **File**: `interactions-api.yaml`
- **Description**: Complete REST API for interaction tracking and management
- **Base URL**: `/functions/v1/interactions`
- **Features**:
  - CRUD operations for interactions
  - GPS location tracking
  - File attachment management
  - Timeline views
  - Follow-up reminders
  - Mobile optimization

## Viewing the Documentation

### Online Swagger Editor
1. Go to [editor.swagger.io](https://editor.swagger.io/)
2. Copy and paste the YAML content
3. View the interactive documentation

### Local Development
```bash
# Install swagger-ui-serve (if not already installed)
npm install -g swagger-ui-serve

# Serve the documentation
swagger-ui-serve docs/api/interactions-api.yaml
```

### VS Code Extension
Install the "Swagger Viewer" extension in VS Code to preview the documentation directly in the editor.

## Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All endpoints follow consistent error response formats:

- **400**: Validation errors with detailed field-level messages
- **401**: Authentication required or token expired
- **404**: Resource not found
- **500**: Internal server errors

## Rate Limiting

- 1000 requests per hour per user
- 100 requests per minute per user

## Support

For API support or questions, contact the development team or check the main project documentation.