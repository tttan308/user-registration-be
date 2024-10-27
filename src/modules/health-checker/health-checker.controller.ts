import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { trace } from '@opentelemetry/api';

import { ServiceHealthIndicator } from './health-indicators/service.indicator';

@Controller('health')
export class HealthCheckerController {
  constructor(
    private healthCheckService: HealthCheckService,
    private ormIndicator: TypeOrmHealthIndicator,
    private serviceIndicator: ServiceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    // get a trace context
    const tracer = trace.getTracer('basic');

    // create a span
    const span = tracer.startSpan('Healthcheck');

    // add some meta data to the span
    span.setAttribute('thisAttribute', 'this is a value set manually');
    span.addEvent('got the data from store', {
      ['manualEventAttribute']: 'this is a value',
    });

    // finalise the span
    span.end();

    return this.healthCheckService.check([
      () => this.ormIndicator.pingCheck('database', { timeout: 1500 }),
      () => this.serviceIndicator.isHealthy('search-service-health'),
    ]);
  }
}
