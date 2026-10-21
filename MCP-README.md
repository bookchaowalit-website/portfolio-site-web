# MCP Server Documentation

The portfolio exposes a **Model Context Protocol (MCP)** endpoint at `/api/mcp` that allows AI assistants (Claude, ChatGPT, etc.) to query portfolio data as tools.

---

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/mcp` | Server info, capabilities, and tool listing |
| `POST` | `/api/mcp` | MCP protocol requests (initialize, tools/list, tools/call) |
| `OPTIONS` | `/api/mcp` | CORS preflight (allows all origins) |

**Production:** `https://bookchaowalit.com/api/mcp`
**Local:** `http://localhost:3000/api/mcp`

---

## Available Tools

### `get_projects`

List all portfolio projects with tech stacks, descriptions, and links.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `featured` | `boolean` | No | If `true`, only return featured projects |

**Example:**
```json
{
  "tool": "get_projects",
  "args": { "featured": true }
}
```

---

### `get_skills`

Get technical, creative, and multimedia skills organized by category.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `category` | `string` | No | Filter by category (e.g., `languages`, `frameworks`, `databases`, `cloud`) |

**Example:**
```json
{
  "tool": "get_skills",
  "args": { "category": "languages" }
}
```

---

### `get_blog_posts`

List all MDX blog posts with metadata.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `limit` | `number` | No | Maximum number of posts (1–50) |
| `featured` | `boolean` | No | If `true`, only return featured posts |
| `tag` | `string` | No | Filter by tag |

**Example:**
```json
{
  "tool": "get_blog_posts",
  "args": { "limit": 5, "featured": true }
}
```

---

### `get_blog_post`

Get the full content of a specific blog post by slug.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `slug` | `string` | Yes | The blog post slug (e.g., `building-scalable-react-applications`) |

**Example:**
```json
{
  "tool": "get_blog_post",
  "args": { "slug": "building-scalable-react-applications" }
}
```

---

### `get_github_repos`

Fetch recent GitHub repositories (live data from GitHub API).

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `limit` | `number` | No | Maximum number of repos (1–30), default 8 |

**Example:**
```json
{
  "tool": "get_github_repos",
  "args": { "limit": 10 }
}
```

---

### `get_contact_info`

Get contact details and social links. No parameters.

**Example:**
```json
{
  "tool": "get_contact_info",
  "args": {}
}
```

---

## Protocol Details

The server supports the following MCP message types via `POST`:

| Message Type | Description |
|-------------|-------------|
| `initialize` | Returns server info and capabilities |
| `tools/list` | Returns all available tools with input schemas |
| `tools/call` | Executes a tool and returns the result |
| `ping` | Returns `pong` (health check) |

### Request Format (tools/call)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_projects",
    "arguments": { "featured": true }
  },
  "id": 1
}
```

### Simplified Format (also supported)

```json
{
  "tool": "get_projects",
  "args": { "featured": true }
}
```

### Response Format

**Success:**
```json
{
  "type": "tools/call/response",
  "tool": "get_projects",
  "result": "{ ... JSON data ... }"
}
```

**Error:**
```json
{
  "type": "tools/call/response",
  "tool": "get_projects",
  "error": true,
  "result": "{ ... error details ... }"
}
```

### JSON-RPC Error Codes

| Code | Meaning |
|------|---------|
| `-32700` | Parse error (invalid JSON) |
| `-32601` | Method not found / tool not found |
| `-32602` | Invalid params (missing required fields) |

---

## Integration with AI Assistants

### Claude Desktop

Add to your Claude Desktop MCP config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bookchaowalit-portfolio": {
      "type": "http",
      "url": "https://bookchaowalit.com/api/mcp"
    }
  }
}
```

For local development:

```json
{
  "mcpServers": {
    "bookchaowalit-portfolio": {
      "type": "http",
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

### cURL

```bash
# Server info
curl https://bookchaowalit.com/api/mcp

# List tools
curl -X POST https://bookchaowalit.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"type": "tools/list"}'

# Call a tool
curl -X POST https://bookchaowalit.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_projects", "args": {}}'
```

---

## Testing

```bash
# Start the dev server
npm run dev

# In another terminal — run the test script
npm run mcp:test
```

The test script (`scripts/test-mcp.mjs`) verifies all six tools return valid responses.

---

## Architecture

```
src/app/api/mcp/route.ts       # Route handler (POST, GET, OPTIONS)
src/lib/mcp/
├── config.ts                   # Server name, version, capabilities
├── types.ts                    # TypeScript interfaces
└── tools/
    ├── index.ts                # Tool registry (mcpToolsMap)
    ├── get-projects.ts         # Portfolio projects handler
    ├── get-skills.ts           # Skills handler
    ├── get-blog-posts.ts       # Blog listing handler
    ├── get-blog-post.ts        # Single blog post handler
    ├── get-github-repos.ts     # GitHub API handler
    └── get-contact-info.ts     # Contact info handler
```

- **Runtime:** Node.js (required for full MCP SDK compatibility)
- **Data sources:** Static project data, MDX files, GitHub API
- **Auth:** None required — all data is public
- **CORS:** Enabled (`Access-Control-Allow-Origin: *`)

---

## Security

- All operations are **read-only**
- No authentication required (public portfolio data)
- GitHub API calls are rate-limited (60 req/hr unauthenticated, 5000 with token)
- CORS is open — restrict in production if needed via Vercel Edge Config

---

## Resources

- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Claude MCP Documentation](https://docs.anthropic.com/claude/docs/mcp)
- [GitHub Repository](https://github.com/bookchaowalit-website/portfolio-site-web)
