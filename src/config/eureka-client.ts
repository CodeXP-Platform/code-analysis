import { Eureka } from "@rocketsoftware/eureka-js-client";

const port = process.env.PORT || 3000;

export const client = new Eureka({
    instance: {
        app: "code-analysis-service",
        hostName: "localhost",
        ipAddr: "127.0.0.1",
        statusPageUrl: `http://localhost:${port}/info`,
        healthCheckUrl: `http://localhost:${port}/health`,
        port: {
            $: port,
            "@enabled": true,
        },
        vipAddress: "code-analysis-service",
        dataCenterInfo: {
            "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
            name: "MyOwn",
        },
    },
    eureka: {
        host: "localhost",
        port: 8761,
        servicePath: "/eureka/apps/",
    },
});

// Inicia la conexión con Eureka
client.start((error: any) => {
    console.log(error || "Node service registered in Eureka");
});
