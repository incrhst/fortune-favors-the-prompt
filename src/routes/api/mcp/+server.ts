import { createMCPServer } from '$lib/server/mcp';
import { SvelteKitSSETransport } from '$lib/server/mcp-transport';
import type { RequestHandler } from './$types';
import { decryptSession } from '$lib/server/session';

export const config = {
    runtime: 'edge'
};

// Map to store active transports: sessionId -> transport
const transports = new Map<string, SvelteKitSSETransport>();

export const GET: RequestHandler = async ({ request, url }) => {
    // Basic auth check using session cookie or API key
    // For SSE, we might prefer a query param or cookie since EventSource headers are limited
    const apiKey = request.headers.get('X-API-Key') || url.searchParams.get('apiKey');

    // We authorize here but the actual user context is needed for the session
    // We'll attach the user info to the transport or reconstruct it on message
    let user = null;
    if (apiKey) {
        const session = await decryptSession(apiKey);
        if (session) {
            user = {
                id: session.userId,
                username: session.username,
                accessToken: session.accessToken
            };
        }
    }

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const sessionId = crypto.randomUUID();
    const transport = new SvelteKitSSETransport(sessionId);
    const mcpServer = createMCPServer(user);

    await mcpServer.connect(transport);

    transports.set(sessionId, transport);

    const stream = new ReadableStream({
        start(controller) {
            transport.setController(controller);

            transport.onclose = () => {
                // Controller isn't closed here, the stream is closed by the browser/client
                // But we should clean up
                transports.delete(sessionId);
            };
        },
        cancel() {
            transports.delete(sessionId);
            mcpServer.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });
};

export const POST: RequestHandler = async ({ request, url }) => {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        return new Response('Missing sessionId', { status: 400 });
    }

    const transport = transports.get(sessionId);
    if (!transport) {
        return new Response('Session not found', { status: 404 });
    }

    try {
        const message = await request.json();
        await transport.handlePostMessage(message);
        return new Response('Accepted', { status: 202 });
    } catch (err) {
        return new Response(String(err), { status: 500 });
    }
};
