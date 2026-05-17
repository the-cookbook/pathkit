import { compile, match } from '@cookbook/pathkit';

const compileMetric = compile('.metrics.{namespace}.{name}', {
  delimiter: '.',
});

console.log(compileMetric({ namespace: 'api', name: 'latency' }));
// .metrics.api.latency

const matchMetric = match('.metrics.{namespace}.{name}', {
  delimiter: '.',
});

console.log(matchMetric('.metrics.api.latency'));
// { match: true, params: { namespace: 'api', name: 'latency' } }
