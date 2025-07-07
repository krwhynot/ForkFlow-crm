# ForkFlow CRM Documentation

## Installation

Check the project [README](../README.md#installation) for installation instructions.

## Quick Start

**🚀 Setting Up Authentication**: If you're setting up ForkFlow CRM for the first time, start with the [Authentication System Guide](./developer/authentication.md) to configure your authentication system.

## Architecture Documentation

### Architectural Decision Records (ADRs)
All architectural decisions are documented in ADRs for transparency and future reference:

- [ADR Directory](./architecture/decisions/) - Overview of all architectural decisions
- [ADR-001: Circular Dependency Resolution](./architecture/decisions/ADR-001-circular-dependency-resolution.md)
- [ADR-002: Component Architecture Reorganization](./architecture/decisions/ADR-002-component-architecture-reorganization.md)
- [ADR-003: UI Kit Domain Organization](./architecture/decisions/ADR-003-ui-kit-domain-organization.md)
- [ADR-004: Dependency Analysis Strategy](./architecture/decisions/ADR-004-dependency-analysis-strategy.md)

## User Documentation

1. [User Management](./user/user-management.md)
2. [Importing And Exporting Data](./user/import-contacts.md)
3. [Inbound Email](./user/inbound-email.md)

## Developer Documentation

### Core Guides
- [Project Roadmap & Planning](../TODO.md)
- [Using Fake Rest Data Provider for Development](./developer/data-providers.md)
- [Authentication System Guide](./developer/authentication.md)

### Customization
- [Changing The Constants](./developer/customizing.md)
- [Theming](./developer/theming.md)
- [Updating The Model](./developer/migrations.md)

### Deployment
- [Configuring Supabase](./developer/supabase-configuration.md)
- [Configuring Inbound Email](./developer/inbound-email-configuration.md) *(optional)*
- [Deployment](./developer/deploy.md)

## Project Information

- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Guidelines](./SECURITY.md)
- [Integration Examples](./INTEGRATION_EXAMPLES.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
