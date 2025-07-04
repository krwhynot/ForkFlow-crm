/// <reference types="vite/client" />

declare module 'tailwind-config' {
    import { Config } from 'tailwindcss';
    const config: Config;
    export default config;
}

declare module 'tailwindcss/resolveConfig' {
    import { Config } from 'tailwindcss';
    function resolveConfig(config: Config): any;
    export default resolveConfig;
}
