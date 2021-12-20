import type { Config } from '@jest/types'
const config: Config.InitialOptions = {
    clearMocks: true,
    testMatch: ['<rootDir>/src/**/*.test.ts'],
}
export default config
