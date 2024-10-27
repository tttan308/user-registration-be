/* eslint-disable promise/catch-or-return */
/* eslint-disable n/no-process-exit */
/* eslint-disable no-console */
// // Enable logging for debugging
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK, tracing } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export const initTelemetry = (config: {
  appName: string;
  telemetryUrl: string;
}): void => {
  const traceExporter = new OTLPTraceExporter({
    url: config.telemetryUrl,
  });

  const tracer = new NodeSDK({
    traceExporter,
    // metricReader,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
    ],
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: config.appName,
    }),
    spanProcessors: [
      new tracing.SimpleSpanProcessor(traceExporter),
      new tracing.BatchSpanProcessor(traceExporter),
    ],
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry
  tracer.start();

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    tracer
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};
