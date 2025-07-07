/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    /* Prevent circular dependencies */
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true
      }
    },
    
    /* Prevent orphan modules */
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Orphan modules (not used anywhere) should be removed',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$',                              // type definitions
          '(^|/)(?:test|spec)\\.',                   // test files
          '(^|/)(?:test|spec)s?/',                   // test directories
          '\\.(test|spec)\\.(js|mjs|cjs|ts|ls|coffee|litcoffee|coffee\\.md)$' // test files
        ]
      },
      to: {}
    },

    /* Architecture rules */
    {
      name: 'no-business-to-ui-kit',
      severity: 'error',
      comment: 'Business components should not directly import ui-kit components; use core components instead',
      from: {
        path: '^src/components/business/'
      },
      to: {
        path: '^src/components/ui-kit/'
      }
    },

    {
      name: 'no-core-to-business',
      severity: 'error',
      comment: 'Core components should not depend on business logic',
      from: {
        path: '^src/components/core/'
      },
      to: {
        path: '^src/components/business/'
      }
    },

    {
      name: 'no-core-to-features',
      severity: 'error',
      comment: 'Core components should not depend on feature-specific logic',
      from: {
        path: '^src/components/core/'
      },
      to: {
        path: '^src/components/features/'
      }
    }
  ],

  options: {
    /* Include TypeScript files */
    doNotFollow: {
      path: 'node_modules'
    },
    
    /* Include these file types */
    includeOnly: '\\.(js|jsx|ts|tsx)$',
    
    /* Focus on src directory */
    focus: '^src/',
    
    /* Typescript and module resolution options */
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    
    /* Module systems */
    moduleSystems: ['amd', 'cjs', 'es6', 'tsd'],
    
    /* Report options */
    reporterOptions: {
      dot: {
        /* Options for the dot reporter */
        collapsePattern: '^src/components/[^/]+',
        filters: {
          includeOnly: {
            path: '^src/'
          }
        }
      }
    }
  }
};