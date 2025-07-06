#!/usr/bin/env node

/**
 * Custom CSS Analysis for ForkFlow CRM
 * Analyzes custom CSS utilities, their usage, and relationships
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class CustomCSSAnalyzer {
    constructor() {
        this.customUtilities = new Map();
        this.usagePatterns = new Map();
        this.cssVariables = new Map();
        this.mediaQueries = [];
        this.accessibilityFeatures = [];
    }

    async analyzeCustomCSS() {
        console.log('🎨 Analyzing custom CSS utilities and patterns...');
        
        // Analyze main CSS file
        await this.analyzeMainCSS();
        
        // Analyze Storybook CSS files
        await this.analyzeStorybookCSS();
        
        // Check usage across codebase
        await this.analyzeUsagePatterns();
        
        // Analyze responsive patterns
        await this.analyzeResponsivePatterns();
        
        return this.generateCustomCSSReport();
    }

    async analyzeMainCSS() {
        const mainCSSPath = 'src/index.css';
        
        if (!fs.existsSync(mainCSSPath)) {
            console.log('⚠️ Main CSS file not found');
            return;
        }
        
        const content = fs.readFileSync(mainCSSPath, 'utf8');
        console.log('📄 Analyzing src/index.css...');
        
        // Extract custom utility classes
        this.extractCustomUtilities(content, mainCSSPath);
        
        // Extract CSS variables
        this.extractCSSVariables(content);
        
        // Extract media queries
        this.extractMediaQueries(content, mainCSSPath);
        
        // Extract accessibility features
        this.extractAccessibilityFeatures(content);
    }

    extractCustomUtilities(content, filePath) {
        // Match CSS classes
        const classRegex = /\.([a-zA-Z-_][a-zA-Z0-9-_]*)\s*{([^}]*)}/g;
        let match;
        
        while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            const properties = match[2].trim();
            
            // Skip Tailwind directives
            if (className.startsWith('@') || properties.includes('@tailwind') || properties.includes('@apply')) {
                continue;
            }
            
            this.customUtilities.set(className, {
                file: filePath,
                properties: this.parseProperties(properties),
                rawCSS: properties,
                type: this.classifyUtility(className, properties),
                touchOptimized: this.isTouchOptimized(properties),
                responsive: this.isResponsive(properties)
            });
        }
    }

    parseProperties(propertiesString) {
        const properties = {};
        const lines = propertiesString.split(';').filter(line => line.trim());
        
        for (const line of lines) {
            const [property, value] = line.split(':').map(part => part.trim());
            if (property && value) {
                properties[property] = value;
            }
        }
        
        return properties;
    }

    classifyUtility(className, properties) {
        if (className.includes('touch')) return 'touch-target';
        if (className.includes('priority')) return 'priority-indicator';
        if (className.includes('status')) return 'status-indicator';
        if (className.includes('organization')) return 'organization-component';
        if (className.includes('form')) return 'form-component';
        if (className.includes('filter')) return 'filter-component';
        if (className.includes('search')) return 'search-component';
        if (properties.includes('min-height') && properties.includes('44px')) return 'accessibility';
        return 'general';
    }

    isTouchOptimized(properties) {
        return properties.includes('44px') || 
               properties.includes('min-height') || 
               properties.includes('min-width');
    }

    isResponsive(properties) {
        return properties.includes('@media') || 
               properties.includes('responsive');
    }

    extractCSSVariables(content) {
        const variableRegex = /--([a-zA-Z-_][a-zA-Z0-9-_]*)\s*:\s*([^;]+);/g;
        let match;
        
        while ((match = variableRegex.exec(content)) !== null) {
            const varName = match[1];
            const varValue = match[2].trim();
            
            this.cssVariables.set(varName, {
                value: varValue,
                type: this.classifyVariable(varName, varValue)
            });
        }
    }

    classifyVariable(name, value) {
        if (name.includes('color') || value.includes('#') || value.includes('rgb')) return 'color';
        if (name.includes('size') || name.includes('space') || value.includes('px') || value.includes('rem')) return 'spacing';
        if (name.includes('font') || value.includes('font')) return 'typography';
        return 'other';
    }

    extractMediaQueries(content, filePath) {
        const mediaRegex = /@media\s*([^{]+)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g;
        let match;
        
        while ((match = mediaRegex.exec(content)) !== null) {
            const condition = match[1].trim();
            const rules = match[2].trim();
            
            this.mediaQueries.push({
                file: filePath,
                condition: condition,
                rules: rules,
                type: this.classifyMediaQuery(condition)
            });
        }
    }

    classifyMediaQuery(condition) {
        if (condition.includes('prefers-reduced-motion')) return 'accessibility-motion';
        if (condition.includes('prefers-contrast')) return 'accessibility-contrast';
        if (condition.includes('max-width') || condition.includes('min-width')) return 'responsive';
        if (condition.includes('hover')) return 'interaction';
        return 'other';
    }

    extractAccessibilityFeatures(content) {
        const a11yPatterns = [
            { pattern: /prefers-reduced-motion/g, type: 'reduced-motion' },
            { pattern: /prefers-contrast/g, type: 'high-contrast' },
            { pattern: /outline[^:]*:\s*[^;]+/g, type: 'focus-outline' },
            { pattern: /min-(height|width)\s*:\s*44px/g, type: 'touch-target' },
            { pattern: /:focus[^{]*{[^}]*}/g, type: 'focus-state' }
        ];
        
        for (const { pattern, type } of a11yPatterns) {
            const matches = content.match(pattern) || [];
            if (matches.length > 0) {
                this.accessibilityFeatures.push({
                    type: type,
                    count: matches.length,
                    examples: matches.slice(0, 3)
                });
            }
        }
    }

    async analyzeStorybookCSS() {
        const storybookFiles = await glob('src/stories/*.css');
        
        for (const file of storybookFiles) {
            const content = fs.readFileSync(file, 'utf8');
            console.log(`📄 Analyzing ${file}...`);
            
            this.extractCustomUtilities(content, file);
        }
    }

    async analyzeUsagePatterns() {
        console.log('🔍 Analyzing custom CSS usage patterns...');
        
        const sourceFiles = await glob('src/**/*.{tsx,jsx,ts,js}');
        
        for (const [className] of this.customUtilities) {
            const usage = await this.findClassUsage(className, sourceFiles);
            this.usagePatterns.set(className, usage);
        }
    }

    async findClassUsage(className, files) {
        const usage = {
            count: 0,
            files: [],
            contexts: []
        };
        
        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const regex = new RegExp(`['"\`]([^'"\`]*\\b${className}\\b[^'"\`]*)['"\`]`, 'g');
                let match;
                
                while ((match = regex.exec(content)) !== null) {
                    usage.count++;
                    if (!usage.files.includes(file)) {
                        usage.files.push(file);
                    }
                    usage.contexts.push({
                        file: file,
                        context: match[1].trim()
                    });
                }
            } catch (error) {
                // Skip unreadable files
            }
        }
        
        return usage;
    }

    async analyzeResponsivePatterns() {
        console.log('📱 Analyzing responsive design patterns...');
        
        // Analyze breakpoint usage from Tailwind config
        if (fs.existsSync('tailwind.config.js')) {
            const configContent = fs.readFileSync('tailwind.config.js', 'utf8');
            this.analyzeBreakpointUsage(configContent);
        }
    }

    analyzeBreakpointUsage(configContent) {
        const breakpointRegex = /screens\s*:\s*{([^}]*)}/;
        const match = configContent.match(breakpointRegex);
        
        if (match) {
            const breakpointsSection = match[1];
            const breakpoints = {};
            
            const breakpointEntries = breakpointsSection.match(/(\w+)\s*:\s*['"]([^'"]+)['"]/g) || [];
            
            for (const entry of breakpointEntries) {
                const [, name, value] = entry.match(/(\w+)\s*:\s*['"]([^'"]+)['"]/);
                breakpoints[name] = value;
            }
            
            this.breakpointConfig = breakpoints;
        }
    }

    generateCustomCSSReport() {
        const report = {
            metadata: {
                analysisDate: new Date().toISOString(),
                customUtilities: this.customUtilities.size,
                cssVariables: this.cssVariables.size,
                mediaQueries: this.mediaQueries.length,
                accessibilityFeatures: this.accessibilityFeatures.length
            },
            customUtilities: {
                byType: this.groupUtilitiesByType(),
                byUsage: this.sortUtilitiesByUsage(),
                touchOptimized: this.getTouchOptimizedUtilities(),
                details: Object.fromEntries(this.customUtilities)
            },
            usagePatterns: Object.fromEntries(this.usagePatterns),
            cssVariables: Object.fromEntries(this.cssVariables),
            mediaQueries: this.mediaQueries,
            accessibilityFeatures: this.accessibilityFeatures,
            responsiveDesign: {
                breakpointConfig: this.breakpointConfig || null,
                mediaQueryTypes: this.groupMediaQueriesByType()
            },
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    groupUtilitiesByType() {
        const groups = {};
        
        for (const [name, utility] of this.customUtilities) {
            const type = utility.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(name);
        }
        
        return groups;
    }

    sortUtilitiesByUsage() {
        return Array.from(this.usagePatterns.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([name, usage]) => ({
                name,
                usageCount: usage.count,
                filesUsed: usage.files.length
            }));
    }

    getTouchOptimizedUtilities() {
        return Array.from(this.customUtilities.entries())
            .filter(([name, utility]) => utility.touchOptimized)
            .map(([name, utility]) => ({
                name,
                properties: utility.properties
            }));
    }

    groupMediaQueriesByType() {
        const groups = {};
        
        for (const mq of this.mediaQueries) {
            const type = mq.type;
            if (!groups[type]) groups[type] = 0;
            groups[type]++;
        }
        
        return groups;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check for unused utilities
        const unusedUtilities = Array.from(this.usagePatterns.entries())
            .filter(([name, usage]) => usage.count === 0)
            .map(([name]) => name);
            
        if (unusedUtilities.length > 0) {
            recommendations.push({
                type: 'Unused CSS',
                severity: 'Low',
                issue: `${unusedUtilities.length} custom utilities are not being used`,
                utilities: unusedUtilities,
                solution: 'Consider removing unused custom utilities to reduce bundle size'
            });
        }
        
        // Check for accessibility coverage
        const hasReducedMotion = this.accessibilityFeatures.some(f => f.type === 'reduced-motion');
        const hasHighContrast = this.accessibilityFeatures.some(f => f.type === 'high-contrast');
        
        if (!hasReducedMotion || !hasHighContrast) {
            recommendations.push({
                type: 'Accessibility',
                severity: 'Medium',
                issue: 'Missing some accessibility features',
                missing: [
                    !hasReducedMotion && 'prefers-reduced-motion support',
                    !hasHighContrast && 'prefers-contrast support'
                ].filter(Boolean),
                solution: 'Add media queries for better accessibility support'
            });
        }
        
        // Check touch targets
        const touchTargets = this.getTouchOptimizedUtilities();
        if (touchTargets.length === 0) {
            recommendations.push({
                type: 'Mobile UX',
                severity: 'High',
                issue: 'No touch-optimized utilities found',
                solution: 'Add utilities with 44px minimum touch targets for mobile accessibility'
            });
        }
        
        return recommendations;
    }

    async saveReport(report) {
        const outputFile = 'custom-css-analysis.json';
        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
        
        console.log(`\n✅ Custom CSS analysis complete! Report saved to ${outputFile}`);
        console.log('\n📊 Custom CSS Summary:');
        console.log(`- Custom utilities: ${report.metadata.customUtilities}`);
        console.log(`- CSS variables: ${report.metadata.cssVariables}`);
        console.log(`- Media queries: ${report.metadata.mediaQueries}`);
        console.log(`- Accessibility features: ${report.metadata.accessibilityFeatures}`);
        
        console.log('\n🔥 Most used custom utilities:');
        report.customUtilities.byUsage.slice(0, 5).forEach((util, index) => {
            console.log(`${index + 1}. ${util.name} - used ${util.usageCount} times in ${util.filesUsed} files`);
        });
        
        console.log('\n📱 Touch-optimized utilities:');
        report.customUtilities.touchOptimized.forEach((util, index) => {
            console.log(`${index + 1}. ${util.name}`);
        });
        
        console.log(`\n⚠️ Recommendations: ${report.recommendations.length}`);
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.severity}] ${rec.type}: ${rec.issue}`);
        });
    }
}

// Run the analysis
const analyzer = new CustomCSSAnalyzer();
const report = await analyzer.analyzeCustomCSS();
await analyzer.saveReport(report);

export default CustomCSSAnalyzer;