export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiErrorEnvelope {
  message?: string;
  error?: string;
  statusCode?: number;
}

