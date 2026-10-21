/**
 * MCP API Route
 * Implements Model Context Protocol server endpoint for Next.js
 *
 * This endpoint provides MCP-compatible tool access over HTTP/HTTPS
 * Suitable for deployment on Vercel and other serverless platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { MCP_SERVER_INFO } from '@/lib/mcp/config';
import { mcpToolsMap } from '@/lib/mcp/tools';
import {
  handleGetProjects,
  handleGetSkills,
  handleGetBlogPosts,
  handleGetBlogPost,
  handleGetGithubRepos,
  handleGetContactInfo,
} from '@/lib/mcp/tools';

export const runtime = 'nodejs'; // MCP requires Node.js runtime for full compatibility

// Tool handlers mapping
const toolHandlers = {
  get_projects: handleGetProjects,
  get_skills: handleGetSkills,
  get_blog_posts: handleGetBlogPosts,
  get_blog_post: handleGetBlogPost,
  get_github_repos: handleGetGithubRepos,
  get_contact_info: handleGetContactInfo,
};

/**
 * Handle MCP requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle different MCP message types
    const messageType = body.type || body.method;

    switch (messageType) {
      case 'initialize':
      case 'initialize/request':
        return handleInitialize(body);

      case 'tools/list':
      case 'tools/list/request':
        return handleListTools();

      case 'tools/call':
      case 'tools/call/request':
        return handleToolCall(body);

      case 'ping':
        return NextResponse.json({ type: 'pong' });

      default:
        // Check if it's a tool call (compatibility with different MCP clients)
        if (body.tool && body.args !== undefined) {
          return handleToolCall(body);
        }

        return NextResponse.json({
          error: {
            code: -32601,
            message: 'Method not found or not supported',
            data: messageType,
          },
        }, { status: 404 });
    }
  } catch (error) {
    console.error('MCP Error:', error);
    return NextResponse.json({
      error: {
        code: -32700,
        message: 'Parse error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
    }, { status: 400 });
  }
}

/**
 * Handle GET request - return server info
 */
export async function GET() {
  return NextResponse.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    description: MCP_SERVER_INFO.description,
    author: MCP_SERVER_INFO.author,
    capabilities: {
      tools: {},
      resources: {
        subscribe: false,
        listChanged: false,
      },
    },
    tools: Array.from(mcpToolsMap.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
    documentation: 'https://github.com/bookchaowalit-website/portfolio-site-web',
    endpoint: '/api/mcp',
  });
}

/**
 * Handle initialize request
 */
function handleInitialize(request: any) {
  return NextResponse.json({
    type: 'initialize/response',
    serverInfo: {
      name: MCP_SERVER_INFO.name,
      version: MCP_SERVER_INFO.version,
    },
    capabilities: {
      tools: {},
      resources: {
        subscribe: false,
        listChanged: false,
      },
    },
    // Include request ID if present
    ...(request.id && { id: request.id }),
  });
}

/**
 * Handle tools/list request
 */
function handleListTools() {
  const tools = Array.from(mcpToolsMap.values()).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  return NextResponse.json({
    type: 'tools/list/response',
    tools,
  });
}

/**
 * Handle tools/call request
 */
async function handleToolCall(request: any) {
  const { tool, args } = request;

  if (!tool) {
    return NextResponse.json({
      error: {
        code: -32602,
        message: 'Invalid params: tool name is required',
      },
    }, { status: 400 });
  }

  const handler = toolHandlers[tool as keyof typeof toolHandlers];

  if (!handler) {
    return NextResponse.json({
      error: {
        code: -32601,
        message: `Tool "${tool}" not found`,
        data: `Available tools: ${Object.keys(toolHandlers).join(', ')}`,
      },
    }, { status: 404 });
  }

  try {
    const result = await handler(args || {});

    // Return in MCP format
    const response: any = {
      type: 'tools/call/response',
      tool,
      result: result.content[0]?.text || '',
    };

    // Include request ID if present
    if (request.id) {
      response.id = request.id;
    }

    // Handle errors
    if (result.isError) {
      return NextResponse.json({
        ...response,
        error: true,
      }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error executing tool ${tool}:`, error);
    return NextResponse.json({
      type: 'tools/call/response',
      tool,
      error: true,
      result: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
