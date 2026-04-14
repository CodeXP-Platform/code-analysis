import { Eureka } from '@rocketsoftware/eureka-js-client';

export const client = new Eureka({
  instance: {
    app: 'code-analysis-service',
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    statusPageUrl: 'http://localhost:3000/info',
    healthCheckUrl: 'http://localhost:3000/health',
    port: {
      '$': 3000,
      '@enabled': true,
    },
    vipAddress: 'code-analysis-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

// Inicia la conexión con Eureka
client.start((error: any) => {
  console.log(error || 'Node service registered in Eureka');
});