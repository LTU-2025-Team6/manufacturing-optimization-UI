/**
 * Problem Details for HTTP API errors (RFC 7807).
 */
export interface IProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: any; // Extensions and any extra fields
}
