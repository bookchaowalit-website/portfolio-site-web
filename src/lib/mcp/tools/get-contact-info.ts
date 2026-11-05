/**
 * MCP Tool: Get Contact Info
 * Returns contact information for Chaowalit
 */

import type { McpTool, McpToolResult } from '../types';

export const getContactInfoTool: McpTool = {
  name: 'get_contact_info',
  description: 'Get contact information for Chaowalit Greepoke including name, title, location, and available contact channels.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetContactInfo(): Promise<McpToolResult> {
  try {
    const contactInfo = {
      name: 'Chaowalit Greepoke (Book)',
      title: 'Generalist & Solopreneur',
      location: 'Bangkok, Thailand',
      languages: ['Thai', 'English'],
      email: process.env.CONTACT_EMAIL || 'bookchaowalit.work@gmail.com',
      phone: '+66 65-416-9146',
      website: 'https://bookchaowalit.com',
      social: {
        github: 'https://github.com/bookchaowalit',
        linkedin: 'https://www.linkedin.com/in/chaowalit-greepoke-b687351a0/',
        twitter: 'https://twitter.com/bookchaowalit',
        devto: 'https://dev.to/bookchaowalit',
        medium: 'https://medium.com/@bookchaowalit',
        upwork: 'https://www.upwork.com/freelancers/~01bb8b7612ad1fd8bc',
        fastwork: 'https://fastwork.co/user/bookchao',
      },
      services: [
        'AI Integration',
        'Full-Stack Development',
        'Data Analytics',
        'Business Growth Consulting',
        'SEO & Digital Marketing',
      ],
      availability: 'Available for freelance projects and consulting',
      responseTime: 'Typically responds within 24-48 hours',
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          contact: contactInfo,
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
