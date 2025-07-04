The MCP tools listed in your configuration serve different purposes depending on the task you’re trying to accomplish. Here's a quick breakdown of when and why to use each one:

✅ Use These When Enabled:
1. @modelcontextprotocol/server-filesystem
Purpose: Read multiple files from your filesystem.

Use when: You want to programmatically analyze or summarize code, docs, or assets from a local directory (r:/Projects/ForkFlow-crm in your case).

2. @upstash/context7-mcp
Purpose: Resolve library IDs and fetch documentation.

Use when: You need context-aware insights about external libraries or want to integrate documentation into context7 workflows.

3. @modelcontextprotocol/server-sequential-thinking
Purpose: Perform chain-of-thought reasoning or multi-step logic.

Use when: You want to simulate multi-step cognitive workflows (e.g., plan → retrieve → synthesize → output).

4. @modelcontextprotocol/server-memory
Purpose: Maintain and query an internal memory graph (create/read entities, relations, observations).

Use when: You need persistent state or want to model knowledge graphs for more intelligent interactions.

5. @supabase/mcp-server-supabase
Purpose: Interact with Supabase projects.

Use when: You want to query, mutate, or listen to data in your Supabase backend (project ref sbrlujvekkpthwztxfyo).

6. exa-mcp-server
Purpose: Perform web and research searches.

Use when: You need up-to-date info from the web, scholarly articles, GitHub, LinkedIn, etc.

7. server-perplexity-ask
Purpose: Query Perplexity for Q&A using real-time internet data.

Use when: You need fast, web-backed answers to open-ended questions.