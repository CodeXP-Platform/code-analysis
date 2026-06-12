import { Eureka } from "@rocketsoftware/eureka-js-client";

const port = Number(process.env.PORT) || 3000;

// Host/puerto con el que ESTE servicio se anuncia en Eureka.
// En Azure Container Apps usamos el FQDN interno (<app>.internal.<dominio>) y el
// puerto 80 del ingress, no localhost. En local caen a los valores por defecto.
const instanceHost = process.env.EUREKA_INSTANCE_HOSTNAME || "localhost";
const advertisedPort = Number(process.env.EUREKA_INSTANCE_PORT) || port;

// Ubicación del servidor Eureka.
const eurekaHost = process.env.EUREKA_HOST || "localhost";
const eurekaPort = Number(process.env.EUREKA_PORT) || 8761;
// En Azure el ingress externo redirige HTTP->HTTPS (301) y el cliente degrada
// el POST de registro a GET -> 404. Con SSL hablamos HTTPS directo (puerto 443).
const eurekaSsl = process.env.EUREKA_SSL === "true";

export const client = new Eureka({
    instance: {
        app: "code-analysis-service",
        hostName: instanceHost,
        ipAddr: instanceHost,
        statusPageUrl: `http://${instanceHost}:${advertisedPort}/info`,
        healthCheckUrl: `http://${instanceHost}:${advertisedPort}/health`,
        port: {
            $: advertisedPort,
            "@enabled": true,
        },
        vipAddress: "code-analysis-service",
        dataCenterInfo: {
            "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
            name: "MyOwn",
        },
    },
    eureka: {
        host: eurekaHost,
        port: eurekaPort,
        servicePath: "/eureka/apps/",
        ssl: eurekaSsl,
    },
});

// Inicia la conexión con Eureka
client.start((error: any) => {
    console.log(error || "Node service registered in Eureka");
});
