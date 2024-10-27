import { HttpStatus } from '@nestjs/common';
import { type Span, type Tracer } from '@opentelemetry/api';

export function createSpan(
  spanName: string,
  url: string,
  method: string,
  tracer: Tracer,
): Span {
  const span = tracer.startSpan(spanName);
  span.setAttribute('http.url', url);
  span.setAttribute('http.method', method);

  return span;
}

export function handleErrorSpan(span: Span, error: unknown) {
  if (error instanceof Error) {
    span.recordException(error);
    span.setAttribute('http.status_code', HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    span.recordException(new Error(String(error)));
    span.setAttribute('http.status_code', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export function handleOkSpan(span: Span) {
  span.setAttribute('http.status_code', HttpStatus.OK);
}
