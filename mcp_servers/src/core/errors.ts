/**
 * Base MCP Error class
 */
export class McpError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "McpError";
  }

  toResponse() {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error [${this.code}]: ${this.message}`,
        },
      ],
    };
  }
}

/**
 * Tool execution error - when a tool fails during execution
 */
export class ToolExecutionError extends McpError {
  constructor(toolName: string, message: string, details?: unknown) {
    super(message, `TOOL_EXECUTION_ERROR:${toolName}`, details);
    this.name = "ToolExecutionError";
  }
}

/**
 * Validation error - when input validation fails
 */
export class ValidationError extends McpError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error - when auth fails
 */
export class AuthenticationError extends McpError {
  constructor(message: string = "Authentication failed", details?: unknown) {
    super(message, "AUTHENTICATION_ERROR", details);
    this.name = "AuthenticationError";
  }
}

/**
 * Not found error
 */
export class NotFoundError extends McpError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<TArgs, TResult>(
  toolName: string,
  handler: (args: TArgs) => Promise<TResult>
): (args: TArgs) => Promise<TResult | { content: Array<{ type: "text"; text: string }> }> {
  return async (args: TArgs) => {
    try {
      return await handler(args);
    } catch (error) {
      if (error instanceof McpError) {
        return error.toResponse();
      }
      
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error in ${toolName}: ${message}`,
          },
        ],
      };
    }
  };
}
