/**
 * MCP Tool: Get Projects
 * Returns information about Chaowalit's projects
 */

import type { McpTool, McpToolResult } from '../types';
import { allProjects, categoryMeta, publicSourceUrl, type ProjectCategory } from '../../../data/app-projects';

export const getProjectsTool: McpTool = {
  name: 'get_projects',
  description: `Get information about Chaowalit Greepoke's projects including name, description, technologies used, demo URLs, and GitHub repositories. Returns all ${allProjects.length} projects or filtered by category or featured status.`,
  inputSchema: {
    type: 'object',
    properties: {
      featured: {
        type: 'boolean',
        description: 'If true, only return featured projects.',
      },
      category: {
        type: 'string',
        description: 'Filter by category: tools, productivity, content, creative, business, social, ai-data, misc, client-work.',
      },
    },
  },
};

export async function handleGetProjects(args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const featuredOnly = args.featured === true;
    const category = args.category as ProjectCategory | undefined;

    let filtered = allProjects;
    if (featuredOnly) {
      filtered = filtered.filter(p => p.featured);
    }
    if (category && category in categoryMeta) {
      filtered = filtered.filter(p => p.category === category);
    }

    const projectsData = filtered.map(project => ({
      name: project.name,
      slug: project.slug,
      category: project.category,
      categoryLabel: categoryMeta[project.category].label,
      description: project.description,
      technologies: project.tech,
      url: project.url,
      githubUrl: publicSourceUrl(project),
      featured: project.featured,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          projects: projectsData,
          count: projectsData.length,
          totalProjects: allProjects.length,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }, null, 2),
      }],
      isError: true,
    };
  }
}
