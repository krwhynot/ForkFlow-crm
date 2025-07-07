# Architectural Decision Records (ADRs)

This directory contains the architectural decision records for ForkFlow CRM.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing or have agreed to implement?

## Rationale
Why are we making this decision? What are the driving factors?

## Consequences
What becomes easier or more difficult to do and any risks introduced by this change?

## Alternatives Considered
What other approaches were considered and why were they rejected?
```

## Current ADRs

- [ADR-001: Circular Dependency Resolution Strategy](./ADR-001-circular-dependency-resolution.md)
- [ADR-002: Component Architecture Reorganization](./ADR-002-component-architecture-reorganization.md)
- [ADR-003: UI Kit Domain-Specific Module Organization](./ADR-003-ui-kit-domain-organization.md)
- [ADR-004: Dependency Analysis and Validation Strategy](./ADR-004-dependency-analysis-strategy.md)

## Related Documentation

### Architecture Guides
- [Component Hierarchy Overview](../component-hierarchy.md) - Visual guide to the 3-tier component structure
- [Data Flow Patterns](../data-flow-patterns.md) - How data flows through providers and components

### Developer Guides
- [Component Integration Guide](../../developer/component-integration-guide.md) - How to add new components to each tier
- [Dependency Monitoring Guide](../../developer/dependency-monitoring-guide.md) - Using automated drift detection