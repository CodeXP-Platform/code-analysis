declare module '@rocketsoftware/eureka-js-client' {
  export class Eureka {
    constructor(config: any);
    start(callback?: (error?: any) => void): void;
    stop(callback?: (error?: any) => void): void;
    getInstancesByAppId(appId: string): any[];
    getInstancesByVipAddress(vipAddress: string): any[];
  }
}