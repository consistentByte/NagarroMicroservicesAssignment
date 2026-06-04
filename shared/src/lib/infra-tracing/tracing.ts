import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';

export function initTracing(serviceName: string) {
  const sdk = new NodeSDK({
    serviceName, // Dynamic per microservice
    sampler: new AlwaysOnSampler(), // Force capture of EVERY trace
    traceExporter: new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        'http://127.0.0.1:4318/v1/traces',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown().finally(() => process.exit(0));
  });
}
