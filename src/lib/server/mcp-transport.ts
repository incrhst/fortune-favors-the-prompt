import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

/**
 * A Transport implementation that writes to a ReadableStreamDefaultController
 * for Server-Sent Events (SSE).
 */
export class SvelteKitSSETransport implements Transport {
    private _controller: ReadableStreamDefaultController | null = null;
    private _sessionId: string;

    public onmessage?: (message: JSONRPCMessage) => void;
    public onclose?: () => void;
    public onerror?: (error: Error) => void;

    constructor(sessionId: string) {
        this._sessionId = sessionId;
    }

    /**
     * Called by the server when it wants to start listening for messages.
     * In SSE, the "connection" is effectively already open.
     */
    async start(): Promise<void> {
        // No-op, we wait for setController
    }

    /**
     * Set the stream controller. This must be called when the SvelteKit 
     * stream starts.
     */
    public setController(controller: ReadableStreamDefaultController) {
        this._controller = controller;

        // Send the initial endpoint event
        this.sendEvent('endpoint', `/api/mcp?sessionId=${this._sessionId}`);
    }

    /**
     * Send a JSON-RPC message to the client via SSE.
     */
    async send(message: JSONRPCMessage): Promise<void> {
        this.sendEvent('message', JSON.stringify(message));
    }

    /**
     * Helper to write an SSE event to the stream.
     */
    private sendEvent(event: string, data: string) {
        if (!this._controller) {
            console.warn("Attempted to send event before controller set", event);
            return;
        }

        try {
            const payload = `event: ${event}\ndata: ${data}\n\n`;
            this._controller.enqueue(new TextEncoder().encode(payload));
        } catch (err) {
            console.error("Error writing to stream", err);
            this.close();
        }
    }

    /**
     * Handle an incoming message (e.g. from a POST request).
     */
    async handlePostMessage(message: JSONRPCMessage) {
        if (this.onmessage) {
            this.onmessage(message);
        }
    }

    async close(): Promise<void> {
        if (this.onclose) {
            this.onclose();
        }
        if (this._controller) {
            try {
                this._controller.close();
            } catch (e) {
                // Ignore errors on close
            }
        }
    }
}
