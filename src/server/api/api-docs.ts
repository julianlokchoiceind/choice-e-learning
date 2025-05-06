/**
 * API documentation utilities
 * Provides a standardized way to document API endpoints
 */

/**
 * API endpoint documentation
 */
export interface ApiEndpointDoc {
  /** Endpoint path */
  path: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Short description of what the endpoint does */
  description: string;
  /** Whether authentication is required */
  requiresAuth: boolean;
  /** Required roles (if applicable) */
  requiredRoles?: string[];
  /** Request body schema (if applicable) */
  requestBody?: {
    /** Content type */
    contentType: string;
    /** Schema description in plain text */
    schema: string;
    /** Example request body */
    example: any;
  };
  /** Response schema */
  responses: {
    /** HTTP status code */
    status: number;
    /** Description of the response */
    description: string;
    /** Example response */
    example: any;
  }[];
  /** Query parameters (if applicable) */
  queryParams?: {
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: string;
    /** Whether the parameter is required */
    required: boolean;
    /** Parameter description */
    description: string;
  }[];
  /** Path parameters (if applicable) */
  pathParams?: {
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: string;
    /** Parameter description */
    description: string;
  }[];
}

/**
 * API documentation
 */
export interface ApiDocs {
  /** API title */
  title: string;
  /** API description */
  description: string;
  /** API version */
  version: string;
  /** Base URL */
  baseUrl: string;
  /** API endpoints */
  endpoints: ApiEndpointDoc[];
}

/**
 * Document an API endpoint
 * @param doc Endpoint documentation
 * @returns The same documentation for chaining
 */
export function documentEndpoint(doc: ApiEndpointDoc): ApiEndpointDoc {
  // In a future version, this could register the documentation
  // with a central registry or generate OpenAPI specs
  return doc;
}

/**
 * Create API documentation
 * @param docs API documentation
 * @returns The same documentation for chaining
 */
export function createApiDocs(docs: ApiDocs): ApiDocs {
  // In a future version, this could register the documentation
  // or generate OpenAPI specs
  return docs;
}
