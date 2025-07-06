# CLAUDE_Part_2.md

⬅️ **See Part 1 in Claude.md**

This file contains the MCP server documentation and advanced development topics for the ForkFlow-CRM project.

## Exa MCP Server – Help Reference

The Exa MCP Server provides AI-powered web search and research capabilities through the Model Context Protocol (MCP). It integrates with Claude Code to enable intelligent web searches, research paper analysis, company research, and competitive intelligence.

### Usage

```bash
npx -y exa-mcp-server [options]
```

### Commands

The Exa MCP Server is configured via MCP and provides the following tools accessible within Claude Code:

#### Available Tools

- **`web_search_exa`** - Real-time web search with content scraping
- **`research_paper_search`** - Search 100M+ academic papers with full text access
- **`company_research`** - Research companies via website crawling
- **`crawling`** - Extract content from specific URLs
- **`competitor_finder`** - Find competitors for any business
- **`linkedin_search`** - Search LinkedIn for companies
- **`wikipedia_search_exa`** - Search Wikipedia content
- **`github_search`** - Search GitHub repositories and accounts

### Flags/Options

- `--version` - Show version number
- `--tools` - Comma-separated list of tools to enable (default: enables all default tools)
- `--list-tools` - List all available tools and exit
- `--help` - Show help information

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "exa": {
    "command": "npx",
    "args": [
      "-y",
      "exa-mcp-server",
      "--tools=web_search_exa,research_paper_search,company_research,crawling,competitor_finder,linkedin_search,wikipedia_search_exa,github_search"
    ],
    "env": {
      "EXA_API_KEY": "your-api-key"
    }
  }
}
```

#### Research Use Cases for ForkFlow CRM

**Market Research for Food Industry:**
```bash
# Find competitors in food brokerage
competitor_finder("food broker CRM software")

# Research potential clients
company_research("sysco.com")
```

**Technical Documentation:**
```bash
# Research React-admin patterns
research_paper_search("react-admin best practices")

# Find Supabase integration examples
github_search("supabase react-admin integration")
```

**Company Intelligence:**
```bash
# Research restaurant chains for prospecting
web_search_exa("restaurant chains contact information")

# Find LinkedIn profiles for decision makers
linkedin_search("restaurant chain CEO company page")
```

### Notes

- **API Key Required**: Exa MCP Server requires an `EXA_API_KEY` environment variable
- **Default Tools**: Only `web_search_exa` is enabled by default; other tools must be explicitly enabled
- **Rate Limits**: Subject to Exa AI API rate limits and quotas
- **Project Integration**: Configured in `.mcp.json` for use with Claude Code
- **Research Focus**: Particularly valuable for competitive intelligence and market research in the food industry

### Current Project Configuration

The ForkFlow CRM project has all 8 tools enabled:
- Web search for general research
- Academic paper search for industry insights
- Company research for prospect intelligence
- URL crawling for specific content extraction
- Competitor analysis for market positioning
- LinkedIn search for decision maker identification
- Wikipedia search for industry background
- GitHub search for technical solutions

This configuration supports comprehensive research workflows for both technical development and business intelligence gathering in the food broker industry.

## Context7 MCP Server – Help Reference

Context7 is a documentation MCP server that provides access to up-to-date library documentation and code examples. It integrates with Claude Code to enable intelligent documentation lookup and code generation assistance for popular libraries and frameworks.

### Usage

```bash
npx -y @upstash/context7-mcp [options]
```

### Flags/Options

- `--transport <stdio|http|sse>` - Transport type (default: "stdio")
- `--port <number>` - Port for HTTP/SSE transport (default: "3000")
- `-h, --help` - Display help for command

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "Context7": {
    "command": "npx",
    "args": [
      "-y",
      "@upstash/context7-mcp"
    ]
  }
}
```

#### Documentation Lookup for ForkFlow CRM

**React-admin Documentation:**
```bash
# Get React-admin data provider documentation
resolve-library-id("react-admin")
get-library-docs("/react-admin/docs", topic: "data-providers")
```

**Supabase Integration:**
```bash
# Get Supabase client documentation
resolve-library-id("supabase")
get-library-docs("/supabase/supabase", topic: "authentication")
```

**TypeScript Patterns:**
```bash
# Get TypeScript best practices
resolve-library-id("typescript")
get-library-docs("/microsoft/typescript", topic: "interfaces")
```

**UI Components:**
```bash
# Get Headless UI documentation
resolve-library-id("headless-ui")
get-library-docs("/tailwindlabs/headlessui", topic: "react")
```

### Available Tools

- **`resolve-library-id`** - Convert package names to Context7-compatible library IDs
- **`get-library-docs`** - Fetch up-to-date documentation for libraries

### Notes

- **Library Resolution**: Always use `resolve-library-id` first to get the correct library ID format
- **Topic Filtering**: Use the `topic` parameter to focus on specific documentation sections
- **Token Limits**: Default 10,000 tokens per request, configurable for larger documentation needs
- **Library Coverage**: Supports major JavaScript/TypeScript libraries and frameworks
- **Real-time Updates**: Documentation is kept current with latest library versions

### Current Project Integration

Context7 is configured in the ForkFlow CRM project to provide documentation assistance for:
- **React-admin**: CRM framework patterns and best practices
- **Supabase**: Database integration and authentication
- **TypeScript**: Type safety and interface definitions
- **Tailwind CSS**: Styling and responsive design
- **Headless UI**: Accessible component patterns
- **Nivo**: Data visualization components

This integration enables rapid development by providing contextual documentation lookup directly within the development workflow, reducing context switching and improving code quality through access to official documentation and examples.

## Memory MCP Server – Help Reference

The Memory MCP Server provides persistent knowledge graph capabilities through the Model Context Protocol (MCP). It enables AI models to maintain context and remember information across conversations by storing entities, relationships, and observations in a local knowledge graph.

### Usage

```bash
npx -y mcp-knowledge-graph [options]
```

### Commands

The Memory MCP Server is configured via MCP and provides the following tools accessible within Claude Code:

#### Available Tools

- **`create_entities`** - Create multiple new entities in the knowledge graph
- **`create_relations`** - Create multiple new relations between entities (use active voice)
- **`add_observations`** - Add new observations to existing entities
- **`delete_entities`** - Delete multiple entities and their associated relations
- **`delete_observations`** - Delete specific observations from entities
- **`delete_relations`** - Delete multiple relations from the knowledge graph
- **`read_graph`** - Read the entire knowledge graph
- **`search_nodes`** - Search for nodes based on query matching names, types, and observations
- **`open_nodes`** - Open specific nodes by their names

### Flags/Options

- `--memory-path <path>` - Specify path for knowledge graph storage (default: local directory)
- `--help` - Show help information
- `--version` - Show version number

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "memory": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-knowledge-graph",
      "--memory-path",
      "/home/krwhynot/Projects/ForkFlow-crm/.knowledge"
    ]
  }
}
```

#### Knowledge Management for ForkFlow CRM

**Project Context Storage:**
```bash
# Create entities for key project components
create_entities([
  {
    name: "ForkFlow CRM",
    entityType: "project",
    observations: ["React-admin based CRM", "Food broker industry focus", "Mobile-first design"]
  },
  {
    name: "React-admin 5.4",
    entityType: "framework",
    observations: ["Admin framework", "Data providers", "Built-in authentication"]
  }
])

# Create relationships between entities
create_relations([
  {
    from: "ForkFlow CRM",
    to: "React-admin 5.4",
    relationType: "uses"
  }
])
```

**Technical Decision Tracking:**
```bash
# Store architectural decisions
add_observations([
  {
    entityName: "ForkFlow CRM",
    contents: [
      "Uses Supabase for backend services",
      "Implements mobile-first design with 44px touch targets",
      "Integrates Google Maps for location tracking"
    ]
  }
])

# Search for specific technical information
search_nodes("Supabase integration patterns")
```

**Development Pattern Memory:**
```bash
# Store common patterns and solutions
create_entities([
  {
    name: "TypeScript Error Prevention",
    entityType: "development-pattern",
    observations: [
      "Always verify Heroicons names before importing",
      "Use type assertions for react-admin validation",
      "Update data generators after schema changes"
    ]
  }
])
```

### Notes

- **Local Storage**: Knowledge graph stored locally in `.knowledge` directory
- **Persistent Memory**: Information persists across Claude Code sessions
- **Relationship Modeling**: Supports complex entity relationships with typed connections
- **Search Capabilities**: Full-text search across entity names, types, and observations
- **Project Integration**: Configured to store project-specific knowledge in ForkFlow CRM directory
- **Development Context**: Particularly valuable for maintaining context about architectural decisions, code patterns, and project evolution

### Current Project Integration

The Memory MCP Server is configured in the ForkFlow CRM project to provide persistent knowledge management for:
- **Architectural Decisions**: Track technology choices and their rationale
- **Code Patterns**: Remember successful implementations and common solutions
- **Bug Fixes**: Document error resolutions and prevention strategies
- **Project Evolution**: Maintain history of major changes and refactoring decisions
- **Team Knowledge**: Store domain-specific information about food brokerage industry
- **Technical Debt**: Track known issues and planned improvements

This integration ensures that development context and institutional knowledge is preserved and easily accessible, reducing the need to rediscover solutions and enabling better decision-making throughout the project lifecycle.

## Sequential-Thinking MCP Server – Help Reference

The Sequential-Thinking MCP Server provides structured problem-solving capabilities through the Model Context Protocol (MCP). It enables AI models to break down complex problems into sequential thinking steps, supporting dynamic analysis, revision, and multi-branch exploration of solutions.

### Usage

```bash
npx -y @modelcontextprotocol/server-sequential-thinking@latest [options]
```

### Commands

The Sequential-Thinking MCP Server is configured via MCP and provides the following tool accessible within Claude Code:

#### Available Tools

- **`sequentialthinking`** - Execute structured thinking process with support for:
  - Sequential step-by-step analysis
  - Dynamic revision of previous thoughts
  - Multi-branch exploration of alternative approaches  
  - Hypothesis generation and verification
  - Adaptive thought count based on problem complexity

### Flags/Options

- `--max-thoughts=<number>` - Maximum number of thinking steps allowed (default: 10)
- `--branch-limit=<number>` - Maximum number of branches for alternative approaches (default: 3)
- `--detail-level=<low|medium|high>` - Level of detail in thinking process (default: medium)
- `--revision-depth=<number>` - Maximum depth for revising previous thoughts (default: 2)
- `--help` - Show help information
- `--version` - Show version number

### Environment Variables

- `DISABLE_THOUGHT_LOGGING` - Set to "true" to disable thought process logging (default: false)

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-sequential-thinking@latest",
      "--max-thoughts=15",
      "--branch-limit=2", 
      "--detail-level=low",
      "--revision-depth=3"
    ],
    "env": {
      "DISABLE_THOUGHT_LOGGING": "false"
    }
  }
}
```

#### Problem-Solving for ForkFlow CRM

**Complex Architecture Decisions:**
```bash
# Analyze database schema design choices
sequentialthinking({
  thought: "Analyzing optimal database schema for food broker CRM",
  thoughtNumber: 1,
  totalThoughts: 8,
  nextThoughtNeeded: true
})

# Consider performance implications of different approaches
sequentialthinking({
  thought: "Evaluating query performance for contact-company relationships",
  thoughtNumber: 2,
  totalThoughts: 8,
  nextThoughtNeeded: true,
  isRevision: false
})
```

**Multi-Step Implementation Planning:**
```bash
# Break down complex feature implementation
sequentialthinking({
  thought: "Planning mobile-first responsive design implementation",
  thoughtNumber: 1,
  totalThoughts: 12,
  nextThoughtNeeded: true
})

# Revise approach based on new insights
sequentialthinking({
  thought: "Reconsidering touch target sizing based on accessibility guidelines",
  thoughtNumber: 5,
  totalThoughts: 12,
  nextThoughtNeeded: true,
  isRevision: true,
  revisesThought: 3
})
```

**Alternative Solution Exploration:**
```bash
# Branch into different technical approaches
sequentialthinking({
  thought: "Exploring Supabase vs custom API for real-time features",
  thoughtNumber: 4,
  totalThoughts: 10,
  nextThoughtNeeded: true,
  branchFromThought: 2,
  branchId: "realtime-approach-a"
})
```

### Notes

- **Dynamic Adaptation**: Thinking process can extend or contract based on problem complexity
- **Revision Support**: Previous thoughts can be questioned and revised as understanding deepens
- **Multi-Branch Analysis**: Supports exploring multiple solution paths simultaneously
- **Hypothesis Testing**: Includes built-in hypothesis generation and verification steps
- **Project Integration**: Configured for low-detail, focused analysis suitable for development workflows
- **Thought Logging**: Maintains detailed logs of reasoning process for review and learning

### Current Project Integration

The Sequential-Thinking MCP Server is configured in the ForkFlow CRM project to provide structured problem-solving for:
- **Architecture Decisions**: Systematic analysis of technical choices and trade-offs
- **Feature Planning**: Breaking complex features into manageable implementation steps
- **Bug Investigation**: Methodical debugging and root cause analysis
- **Performance Optimization**: Structured approach to identifying and resolving bottlenecks
- **Code Refactoring**: Careful analysis of refactoring impacts and approaches
- **Integration Planning**: Step-by-step planning for third-party service integration

This integration enables more thorough and systematic problem-solving, reducing the risk of overlooking critical considerations and improving the quality of technical decisions throughout the development process.

## Filesystem MCP Server – Help Reference

The Filesystem MCP Server provides comprehensive file system access capabilities through the Model Context Protocol (MCP). It enables AI models to perform file operations, directory management, and file system interactions within specified allowed directories, ensuring secure and controlled access to project files.

### Usage

```bash
npx -y @modelcontextprotocol/server-filesystem@latest <allowed_directory> [additional_directories...]
```

### Commands

The Filesystem MCP Server is configured via MCP and provides the following tools accessible within Claude Code:

#### Available Tools

- **`read_file`** - Read complete contents of a file with encoding support
- **`read_multiple_files`** - Read contents of multiple files simultaneously
- **`write_file`** - Create new files or overwrite existing files with content
- **`edit_file`** - Make line-based edits to text files with git-style diff output
- **`create_directory`** - Create new directories or ensure directories exist
- **`list_directory`** - Get detailed directory listings with file/directory distinction
- **`list_directory_with_sizes`** - Get directory listings including file sizes
- **`directory_tree`** - Get recursive tree view of directories as JSON structure
- **`move_file`** - Move or rename files and directories
- **`search_files`** - Recursively search for files and directories by name pattern
- **`get_file_info`** - Retrieve detailed metadata about files and directories
- **`list_allowed_directories`** - List all directories accessible to the server

### Flags/Options

- No command-line flags available
- Configuration is done via directory arguments and environment variables

### Environment Variables

- `MCP_TRANSPORT` - Transport protocol (default: "stdio")
- `MCP_LOG_LEVEL` - Logging level (info, debug, warn, error)
- `NODE_ENV` - Node environment setting

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem@latest",
      "/home/krwhynot/Projects/ForkFlow-crm"
    ],
    "env": {
      "MCP_TRANSPORT": "stdio",
      "MCP_LOG_LEVEL": "info",
      "NODE_ENV": "production"
    }
  }
}
```

#### File Operations for ForkFlow CRM

**Reading Project Files:**
```bash
# Read a single component file
read_file("/home/krwhynot/Projects/ForkFlow-crm/src/contacts/ContactList.tsx")

# Read multiple related files
read_multiple_files([
  "/home/krwhynot/Projects/ForkFlow-crm/src/contacts/ContactList.tsx",
  "/home/krwhynot/Projects/ForkFlow-crm/src/contacts/ContactEdit.tsx",
  "/home/krwhynot/Projects/ForkFlow-crm/src/contacts/index.ts"
])
```

**Project Structure Analysis:**
```bash
# Get complete directory tree
directory_tree("/home/krwhynot/Projects/ForkFlow-crm/src")

# List specific directories
list_directory_with_sizes("/home/krwhynot/Projects/ForkFlow-crm/src/components")

# Search for specific files
search_files("/home/krwhynot/Projects/ForkFlow-crm", "*.test.tsx")
```

**File Modifications:**
```bash
# Edit existing files with line-based changes
edit_file("/home/krwhynot/Projects/ForkFlow-crm/src/types.ts", [
  {
    oldText: "export interface Contact {",
    newText: "export interface Contact {\n  id: string;"
  }
])

# Create new directories
create_directory("/home/krwhynot/Projects/ForkFlow-crm/src/newfeature")

# Move or rename files
move_file(
  "/home/krwhynot/Projects/ForkFlow-crm/src/old-component.tsx",
  "/home/krwhynot/Projects/ForkFlow-crm/src/components/new-component.tsx"
)
```

**File Information and Metadata:**
```bash
# Get detailed file information
get_file_info("/home/krwhynot/Projects/ForkFlow-crm/package.json")

# List all accessible directories
list_allowed_directories()
```

### Notes

- **Security**: Only operates within explicitly allowed directories specified in configuration
- **Encoding Support**: Handles various text encodings and provides detailed error messages
- **Batch Operations**: Supports reading multiple files simultaneously for efficiency
- **Git Integration**: Edit operations provide git-style diff output for change tracking
- **Error Handling**: Provides detailed error messages for failed operations
- **Pattern Matching**: Supports glob patterns for file searching and filtering

### Current Project Integration

The Filesystem MCP Server is configured in the ForkFlow CRM project to provide secure file system access for:
- **Source Code Management**: Reading, editing, and organizing React components and TypeScript files
- **Configuration Files**: Managing package.json, tsconfig.json, and other project configuration
- **Asset Management**: Handling images, styles, and other static assets
- **Migration Scripts**: Managing Supabase migrations and database schema files
- **Documentation**: Reading and updating project documentation and README files
- **Test Files**: Accessing and managing test files and test data
- **Build Artifacts**: Inspecting build outputs and generated files

This integration enables comprehensive file system operations while maintaining security through directory restrictions, supporting all aspects of the development workflow from code editing to project management.

## Perplexity-Ask MCP Server – Help Reference

The Perplexity-Ask MCP Server provides access to Perplexity AI's advanced search and reasoning capabilities through the Model Context Protocol (MCP). It enables AI models to engage in conversational interactions with Perplexity's Sonar API, leveraging real-time web knowledge and sophisticated reasoning for enhanced problem-solving and research capabilities.

### Usage

```bash
npx -y server-perplexity-ask
```

### Commands

The Perplexity-Ask MCP Server is configured via MCP and provides the following tool accessible within Claude Code:

#### Available Tools

- **`perplexity_ask`** - Engage in conversation using Perplexity's Sonar API
  - Accepts an array of messages with role and content
  - Returns AI completion response from Perplexity model
  - Supports conversational context with message history
  - Leverages real-time web knowledge for up-to-date responses

### Flags/Options

- No command-line flags available
- Configuration is done via environment variables

### Environment Variables

- `PERPLEXITY_API_KEY` - **Required** - API key for Perplexity AI services

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "perplexity-ask": {
    "command": "npx",
    "args": [
      "-y",
      "server-perplexity-ask"
    ],
    "env": {
      "PERPLEXITY_API_KEY": "your-api-key"
    }
  }
}
```

#### Research and Problem-Solving for ForkFlow CRM

**Technical Research:**
```bash
# Research latest React-admin best practices
perplexity_ask([
  {
    "role": "system",
    "content": "You are a helpful technical assistant with expertise in React and TypeScript."
  },
  {
    "role": "user", 
    "content": "What are the latest best practices for implementing data providers in React-admin 5.4 with TypeScript?"
  }
])
```

**Industry-Specific Insights:**
```bash
# Get insights about food brokerage industry trends
perplexity_ask([
  {
    "role": "user",
    "content": "What are the current trends in food brokerage CRM systems and mobile-first design for restaurant industry sales?"
  }
])
```

**Architecture Decision Support:**
```bash
# Compare different technical approaches
perplexity_ask([
  {
    "role": "user",
    "content": "Compare Supabase vs Firebase for a React-admin CRM application with real-time features and row-level security requirements."
  }
])
```

**Bug Investigation and Solutions:**
```bash
# Get help with specific technical issues
perplexity_ask([
  {
    "role": "system",
    "content": "You are debugging a React-admin application with TypeScript."
  },
  {
    "role": "user",
    "content": "I'm getting TypeScript errors with react-admin useWatch hook. What are the current alternatives and best practices?"
  }
])
```

**Market and Competitive Analysis:**
```bash
# Research competitive landscape
perplexity_ask([
  {
    "role": "user",
    "content": "What are the top CRM solutions for food brokers and distributors in 2024? What features do they offer?"
  }
])
```

### Notes

- **API Key Required**: Requires a valid Perplexity API key to function
- **Real-time Knowledge**: Accesses current web information and recent developments
- **Conversational Context**: Supports multi-turn conversations with message history
- **Advanced Reasoning**: Leverages Perplexity's sophisticated AI models for complex problem-solving
- **Web Integration**: Combines AI reasoning with real-time web search capabilities
- **Rate Limits**: Subject to Perplexity API rate limits and usage quotas

### Current Project Integration

The Perplexity-Ask MCP Server is configured in the ForkFlow CRM project to provide enhanced research and problem-solving capabilities for:

- **Technical Research**: Getting up-to-date information about React-admin, TypeScript, and Supabase best practices
- **Industry Insights**: Understanding food brokerage industry trends and requirements
- **Architecture Decisions**: Comparing different technical approaches and solutions
- **Bug Resolution**: Finding solutions to specific technical issues and errors
- **Competitive Analysis**: Researching market landscape and competitor features
- **Best Practices**: Learning about current development patterns and methodologies
- **Performance Optimization**: Getting advice on optimization strategies and techniques
- **Security Considerations**: Understanding security best practices for CRM applications

This integration enhances the development workflow by providing access to current knowledge and expert reasoning, helping to make informed technical decisions and solve complex problems more effectively.

## Supabase MCP Server – Help Reference

The Supabase MCP Server provides comprehensive integration with Supabase services through the Model Context Protocol (MCP). It enables AI models to interact with Supabase databases, manage development branches, deploy edge functions, handle migrations, and access project resources directly from the development environment.

### Usage

```bash
npx -y @supabase/mcp-server-supabase@latest --project-ref=<project_reference>
```

### Commands

The Supabase MCP Server is configured via MCP and provides the following tools accessible within Claude Code:

#### Database Operations
- **`execute_sql`** - Execute raw SQL queries in the Postgres database
- **`apply_migration`** - Apply DDL migrations to the database with proper naming
- **`list_tables`** - List all tables in specified schemas
- **`list_extensions`** - List all database extensions
- **`list_migrations`** - List all applied migrations

#### Branch Management
- **`create_branch`** - Create development branches with fresh database instances
- **`list_branches`** - List all development branches and their status
- **`delete_branch`** - Delete development branches
- **`merge_branch`** - Merge branch migrations and edge functions to production
- **`reset_branch`** - Reset branch to specific migration version
- **`rebase_branch`** - Rebase branch on production to handle migration drift

#### Edge Functions
- **`list_edge_functions`** - List all Edge Functions in the project
- **`deploy_edge_function`** - Deploy new or update existing Edge Functions

#### Project Information
- **`get_project_url`** - Get the API URL for the project
- **`get_anon_key`** - Get the anonymous API key for client connections
- **`generate_typescript_types`** - Generate TypeScript types from database schema
- **`search_docs`** - Search Supabase documentation using GraphQL

#### Monitoring and Debugging
- **`get_logs`** - Get recent logs for specific services (api, postgres, auth, etc.)
- **`get_advisors`** - Get security and performance advisory notices

### Flags/Options

- `--project-ref=<reference>` - **Required** - Supabase project reference ID

### Environment Variables

- `SUPABASE_ACCESS_TOKEN` - **Required** - Access token for Supabase management API

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "supabase": {
    "command": "npx",
    "args": [
      "-y",
      "@supabase/mcp-server-supabase@latest",
      "--project-ref=sbrlujvekkpthwztxfyo"
    ],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "your-access-token"
    }
  }
}
```

#### Database Operations for ForkFlow CRM

**Schema Management:**
```bash
# List all tables in public schema
list_tables(["public"])

# Apply a new migration
apply_migration("add_contact_tags", "ALTER TABLE contacts ADD COLUMN tags TEXT[];")

# Generate TypeScript types for the database
generate_typescript_types()
```

**Data Queries:**
```bash
# Query contact data
execute_sql("SELECT id, name, email FROM contacts WHERE company_id = $1 LIMIT 10")

# Check database extensions
list_extensions()

# Review migration history
list_migrations()
```

#### Development Branch Workflow

**Branch Management:**
```bash
# Create a development branch
create_branch("feature-contact-improvements")

# List all branches and their status
list_branches()

# Merge completed feature to production
merge_branch("branch-id-from-list")

# Delete old development branch
delete_branch("old-branch-id")
```

**Branch Operations:**
```bash
# Reset branch to specific migration
reset_branch("branch-id", "20240101000000")

# Rebase branch on latest production
rebase_branch("branch-id")
```

#### Edge Functions Deployment

**Function Management:**
```bash
# List existing Edge Functions
list_edge_functions()

# Deploy a new Edge Function
deploy_edge_function("email-processor", [
  {
    "name": "index.ts",
    "content": "import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'\n\nserve((req: Request) => {\n  return new Response('Hello World!')\n})"
  }
])
```

#### Project Configuration and Monitoring

**Project Information:**
```bash
# Get project API URL
get_project_url()

# Get anonymous key for client connections
get_anon_key()

# Search Supabase documentation
search_docs("{
  searchDocs(query: \"row level security\", limit: 5) {
    nodes {
      title
      content
    }
  }
}")
```

**Monitoring and Debugging:**
```bash
# Get recent API logs
get_logs("api")

# Check for security advisors
get_advisors("security")

# Get performance recommendations
get_advisors("performance")
```

### Notes

- **Project Reference Required**: Must specify project reference ID for all operations
- **Access Token**: Requires valid Supabase access token with appropriate permissions
- **Branch Isolation**: Development branches create isolated database instances
- **Migration Safety**: Always use `apply_migration` for DDL operations, not `execute_sql`
- **Real-time Monitoring**: Logs are limited to recent entries (last minute)
- **Security Advisors**: Regular advisor checks recommended after schema changes
- **TypeScript Integration**: Can generate types directly from database schema

### Current Project Integration

The Supabase MCP Server is configured in the ForkFlow CRM project to provide comprehensive backend management for:

- **Database Schema Management**: Creating and modifying tables, applying migrations, managing extensions
- **Development Workflow**: Branch-based development with isolated database instances
- **Data Operations**: Querying contact data, companies, deals, and activity logs
- **Real-time Features**: Managing subscriptions and real-time data synchronization
- **Authentication**: Configuring user management and row-level security policies
- **Edge Functions**: Deploying serverless functions for email processing and automation
- **Performance Monitoring**: Tracking database performance and identifying optimization opportunities
- **Security Compliance**: Regular security audits and vulnerability assessments
- **Type Safety**: Generating TypeScript definitions from database schema
- **Documentation Access**: Searching Supabase documentation for implementation guidance

This integration provides a complete backend-as-a-service management layer, enabling seamless development, testing, and deployment workflows for the React-admin CRM application.

## Playwright MCP Server – Help Reference

The Playwright MCP Server provides comprehensive web browser automation capabilities through the Model Context Protocol (MCP). It enables AI models to interact with web pages, perform browser automation tasks, take screenshots, generate PDFs, and conduct end-to-end testing workflows directly from the development environment.

### Usage

```bash
npx @playwright/mcp@latest [options]
```

### Commands

The Playwright MCP Server is configured via MCP and provides browser automation tools accessible within Claude Code through the following capabilities:

#### Available Tools

- **`browser_close`** - Close the browser page
- **`browser_resize`** - Resize the browser window to specified dimensions
- **`browser_console_messages`** - Returns all console messages from the browser
- **`browser_handle_dialog`** - Handle browser dialogs (alerts, confirms, prompts)
- **`browser_file_upload`** - Upload files to the browser
- **`browser_install`** - Install the browser specified in configuration
- **`browser_press_key`** - Press keyboard keys
- **`browser_navigate`** - Navigate to URLs
- **`browser_navigate_back`** - Go back to previous page
- **`browser_navigate_forward`** - Go forward to next page
- **`browser_network_requests`** - Returns all network requests since page load
- **`browser_pdf_save`** - Save page as PDF
- **`browser_take_screenshot`** - Take screenshots of current page or elements
- **`browser_snapshot`** - Capture accessibility snapshot (better than screenshot)
- **`browser_click`** - Perform click actions on web elements
- **`browser_drag`** - Perform drag and drop between elements
- **`browser_hover`** - Hover over elements
- **`browser_type`** - Type text into input fields
- **`browser_select_option`** - Select options in dropdowns
- **`browser_tab_list`** - List all browser tabs
- **`browser_tab_new`** - Open new tabs
- **`browser_tab_select`** - Switch between tabs
- **`browser_tab_close`** - Close tabs
- **`browser_generate_playwright_test`** - Generate Playwright test code
- **`browser_wait_for`** - Wait for text/elements or time delays

### Flags/Options

- `-V, --version` - Output the version number
- `--allowed-origins <origins>` - Semicolon-separated list of origins to allow (default: allow all)
- `--blocked-origins <origins>` - Semicolon-separated list of origins to block
- `--block-service-workers` - Block service workers
- `--browser <browser>` - Browser to use: chrome, firefox, webkit, msedge
- `--browser-agent <endpoint>` - Use browser agent (experimental)
- `--caps <caps>` - Comma-separated capabilities: tabs, pdf, history, wait, files, install
- `--cdp-endpoint <endpoint>` - CDP endpoint to connect to
- `--config <path>` - Path to configuration file
- `--device <device>` - Device to emulate (e.g., "iPhone 15")
- `--executable-path <path>` - Path to browser executable
- `--headless` - Run browser in headless mode
- `--host <host>` - Host to bind server (default: localhost)
- `--ignore-https-errors` - Ignore HTTPS errors
- `--isolated` - Keep browser profile in memory only
- `--image-responses <mode>` - Image response handling: allow, omit, auto
- `--no-sandbox` - Disable browser sandbox
- `--output-dir <path>` - Directory for output files
- `--port <port>` - Port for SSE transport
- `--proxy-bypass <bypass>` - Comma-separated domains to bypass proxy
- `--proxy-server <proxy>` - Proxy server specification
- `--save-trace` - Save Playwright trace to output directory
- `--storage-state <path>` - Path to storage state file for sessions
- `--user-agent <ua string>` - Custom user agent string
- `--user-data-dir <path>` - Path to user data directory
- `--viewport-size <size>` - Browser viewport size (e.g., "1280,720")
- `--vision` - Use screenshots instead of Aria snapshots
- `-h, --help` - Display help information

### Examples

#### Basic Configuration (Current Project Setup)
```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest"
    ]
  }
}
```

#### End-to-End Testing for ForkFlow CRM

**Testing Contact Management:**
```bash
# Navigate to contacts page and test functionality
browser_navigate("http://localhost:5173/contacts")
browser_take_screenshot("contacts-page-test")
browser_click("Add Contact button")
browser_type("Contact Name field", "Test Contact")
```

**Testing Dashboard Components:**
```bash
# Test new MFB-themed dashboard
browser_navigate("http://localhost:5173/")
browser_snapshot()  # Better than screenshot for accessibility
browser_click("Weekly Tasks metric card")
browser_wait_for("Task details modal")
```

**Mobile Responsiveness Testing:**
```bash
# Test mobile-first design on different devices
browser_resize(375, 667)  # iPhone SE size
browser_take_screenshot("mobile-dashboard")
browser_resize(768, 1024)  # iPad size
browser_take_screenshot("tablet-dashboard")
```

**Form Validation Testing:**
```bash
# Test contact form validation
browser_navigate("http://localhost:5173/contacts/create")
browser_type("Email field", "invalid-email")
browser_click("Save button")
browser_wait_for("Validation error message")
browser_take_screenshot("form-validation-error")
```

**Visual Regression Testing:**
```bash
# Generate baseline screenshots for visual comparison
browser_navigate("http://localhost:5173/")
browser_take_screenshot("dashboard-baseline")
browser_navigate("http://localhost:5173/contacts")
browser_take_screenshot("contacts-baseline")
```

### Notes

- **Browser Support**: Supports Chrome, Firefox, WebKit, and Microsoft Edge browsers
- **Mobile Testing**: Built-in device emulation for mobile-first design validation
- **Accessibility**: Aria snapshots provide better accessibility testing than screenshots
- **Network Monitoring**: Can capture and analyze network requests for performance testing
- **File Operations**: Supports file uploads and PDF generation for document workflows
- **Session Management**: Persistent storage state for testing authenticated workflows
- **Trace Recording**: Optional Playwright trace recording for debugging test failures

### Current Project Integration

The Playwright MCP Server is configured in the ForkFlow CRM project to provide comprehensive browser automation for:

- **End-to-End Testing**: Testing complete user workflows from login to deal closure
- **Visual Regression**: Ensuring UI consistency across dashboard, contact, and deal pages
- **Mobile Testing**: Validating mobile-first design with 44px touch targets
- **Form Validation**: Testing contact forms, deal creation, and data validation
- **Performance Testing**: Monitoring page load times and network requests
- **Accessibility Testing**: Using Aria snapshots to ensure WCAG compliance
- **Screenshot Documentation**: Generating visual documentation of UI components
- **Cross-Browser Testing**: Ensuring compatibility across Chrome, Firefox, and Safari
- **Authentication Flows**: Testing Supabase auth integration and user sessions
- **Real-time Features**: Validating live updates and WebSocket connections

This integration enables automated quality assurance and regression testing for the React-admin CRM application, ensuring reliable user experiences across all supported devices and browsers.

## Solo Development Risk Management

### Key Concerns and Issues

**1. Effort Overload and Context Switching**  
- **High Workload Risk:** Managing both frontend and backend tasks alone can lead to fatigue and reduced focus. Rapidly switching between UI design, API development, testing, and documentation increases the chance of mistakes and slows overall progress.  
- **Mitigation:** Block dedicated time for each focus area, use Claude to draft code stubs and documentation, and schedule regular mental breaks to maintain clarity.

**2. Reliance on AI Assistance and Hallucination Risk**  
- **Accuracy Dependency:** Claude AI can accelerate coding but may generate incorrect or incomplete logic, especially for complex API behaviors and edge cases. Over-reliance without careful review can introduce subtle bugs.  
- **Mitigation:** Rigorously review and test all AI-suggested code. Write unit and integration tests before trusting generated implementations.

**3. API Contract Definition and Alignment**  
- **Specification Drift:** Without a team to cross-check, it's easy to build endpoints that drift from intended request/response schemas. Inconsistencies lead to integration failures between frontend and backend.  
- **Mitigation:** Define and maintain a single OpenAPI/Swagger file. Use Claude AI to generate both endpoint implementations and matching TypeScript client types.

**4. Integration and Testing Overhead**  
- **Testing Blind Spots:** One developer juggling coding and QA may overlook edge cases—pagination bugs, error handling gaps, or mobile-specific UI quirks.  
- **Mitigation:** Automate tests with clear coverage goals (>80%). Leverage Claude to draft test cases and testing scripts, then validate manually on real devices.

**5. Time Estimation and Schedule Slippage**  
- **Underestimation Tendency:** Solo developers often underestimate queues of small tasks—code reviews, refactoring, CI setup. This leads to slipping deadlines.  
- **Mitigation:** Add at least 30% buffer to all task estimates. Use Claude AI to generate time-tracking logs and daily progress summaries to catch slippage early.

**6. Knowledge Gaps and Skill Limitations**  
- **Full-Stack Demands:** One person must master React-admin UI, TypeScript, Supabase, API security, and mobile optimizations. Gaps in any area can bottleneck the entire project.  
- **Mitigation:** Use Claude to generate learning plans and code examples for unfamiliar technologies. Reserve time each week for skill reinforcement.

**7. Single Point of Failure**  
- **Continuity Risk:** If the sole developer becomes unavailable or overloaded, project momentum halts. Relying on one individual increases delivery risk.  
- **Mitigation:** Document architecture decisions, setup scripts, environment configs, and create an easily shareable project handbook with Claude's help to enable quick onboarding of additional help if needed.

⬅️ **See Part 1 in Claude.md**