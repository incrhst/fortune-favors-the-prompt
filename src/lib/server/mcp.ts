import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { GistService } from "./services/gist";

export function createMCPServer() {
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
    server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
        const { name, arguments: args } = request.params;
        const user = (extra as any).user;

        if (!user || !user.accessToken) {
            return {
                isError: true,
                content: [{ type: "text", text: "Unauthorized: No valid session or API key provided." }],
            };
        }

        const gistService = new GistService(user.accessToken);

        try {
            if (name === "list_prompts") {
                const index = await gistService.getLibraryIndex();
                return {
                    content: [{ type: "text", text: JSON.stringify(index?.prompts || [], null, 2) }],
                };
            }

            if (name === "add_prompt") {
                const { title, content, category, tags, isPublic } = args as any;
                const gistId = await gistService.createPromptGist({
                    title,
                    content,
                    category,
                    tags,
                    isPublic: !!isPublic,
                    collections: []
                });

                // Update index
                let indexData = await gistService.getLibraryIndex();
                const newEntry = {
                    gistId,
                    title,
                    category,
                    tags,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    isPublic: !!isPublic
                };

                if (indexData) {
                    indexData.prompts.push(newEntry);
                    indexData.updated = new Date().toISOString();
                } else {
                    indexData = {
                        version: 1,
                        updated: new Date().toISOString(),
                        collections: [],
                        prompts: [newEntry]
                    };
                }
                await gistService.upsertLibraryIndex(indexData);

                return {
                    content: [{ type: "text", text: `Prompt added successfully! Gist ID: ${gistId}` }],
                };
            }

            throw new Error(`Unknown tool: ${name}`);
        } catch (error: any) {
            return {
                isError: true,
                content: [{ type: "text", text: error.message }],
            };
        }
    });

    return server;
}
