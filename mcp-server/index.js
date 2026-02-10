#!/usr/bin/env node

/**
 * Favored Prompts MCP Server
 * 
 * This server allows agents to interact with the Favored Prompts platform.
 * It requires a FAVORED_PROMPTS_API_KEY environment variable.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const API_KEY = process.env.FAVORED_PROMPTS_API_KEY;
const BASE_URL = process.env.FAVORED_PROMPTS_BASE_URL || "http://localhost:5173";

if (!API_KEY) {
    console.error("FAVORED_PROMPTS_API_KEY environment variable is required");
    process.exit(1);
}

const server = new Server(
    {
        name: "favored-prompts",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Tool definitions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_prompts",
                description: "List all prompts in your personal Favored Prompts library",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "add_prompt",
                description: "Add a new prompt to your Favored Prompts library",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Title of the prompt" },
                        content: { type: "string", description: "Markdown content of the prompt" },
                        category: { type: "string", description: "Optional category (e.g. CODE, WRITING)" },
                        tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
                        isPublic: { type: "boolean", description: "Whether to share with the community (default: false)" },
                    },
                    required: ["title", "content"],
                },
            },
        ],
    };
});

/**
 * Tool handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "list_prompts") {
            const response = await fetch(`${BASE_URL}/api/library/index`, {
                headers: { "X-API-Key": API_KEY },
            });
            if (!response.ok) throw new Error(`API failed: ${response.statusText}`);
            const data = await response.json();
            return {
                content: [{ type: "text", text: JSON.stringify(data.prompts, null, 2) }],
            };
        }

        if (name === "add_prompt") {
            const { title, content, category, tags, isPublic } = args;
            const response = await fetch(`${BASE_URL}/api/library/prompt`, {
                method: "POST",
                headers: {
                    "X-API-Key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content, category, tags, isPublic }),
            });
            if (!response.ok) throw new Error(`API failed: ${response.statusText}`);
            const data = await response.json();
            return {
                content: [{ type: "text", text: `Prompt added successfully! Gist ID: ${data.gistId}` }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: error.message }],
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Favored Prompts MCP server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
