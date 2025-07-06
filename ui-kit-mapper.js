#!/usr/bin/env node

/**
 * UI Kit Component Style Relationship Mapper
 * Analyzes style dependencies between UI kit components and their usage
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class UIKitMapper {
    constructor() {
        this.uiKitComponents = new Map();
        this.componentUsage = new Map();
        this.stylePatterns = new Map();
        this.importGraph = new Map();
    }

    async analyzeUIKit() {
        console.log('🔍 Mapping UI Kit component relationships...');
        
        // First, analyze the ui-kit index file
        await this.analyzeUIKitIndex();
        
        // Then analyze individual components
        await this.analyzeUIKitComponents();
        
        // Analyze usage patterns across the codebase
        await this.analyzeComponentUsage();
        
        return this.generateUIKitReport();
    }

    async analyzeUIKitIndex() {
        const indexPath = 'src/components/ui-kit/index.ts';
        try {
            const content = fs.readFileSync(indexPath, 'utf8');
            
            // Extract exports
            const exportMatches = content.matchAll(/export\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g);
            
            for (const match of exportMatches) {
                const exports = match[1].split(',').map(exp => exp.trim());
                const modulePath = match[2];
                
                exports.forEach(exportName => {
                    this.uiKitComponents.set(exportName, {
                        module: modulePath,
                        fullPath: `src/components/ui-kit/${modulePath}.tsx`,
                        exports: exports,
                        usageCount: 0,
                        styleComplexity: 0
                    });
                });
            }
            
            console.log(`📦 Found ${this.uiKitComponents.size} UI Kit components`);
        } catch (error) {
            console.error('Error analyzing UI Kit index:', error.message);
        }
    }

    async analyzeUIKitComponents() {
        const componentFiles = await glob('src/components/ui-kit/*.{tsx,ts}', {
            ignore: ['src/components/ui-kit/index.ts']
        });

        for (const file of componentFiles) {
            await this.analyzeComponentFile(file);
        }
    }

    async analyzeComponentFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const componentName = path.basename(filePath, path.extname(filePath));
            
            // Extract className usage
            const classNames = this.extractClassNames(content);
            
            // Extract props that affect styling
            const styleProps = this.extractStyleProps(content);
            
            // Extract Tailwind utility patterns
            const tailwindPatterns = this.analyzeTailwindPatterns(classNames);
            
            // Extract component dependencies
            const dependencies = this.extractDependencies(content);
            
            const componentData = this.uiKitComponents.get(componentName) || {};
            this.uiKitComponents.set(componentName, {
                ...componentData,
                file: filePath,
                classNames: classNames,
                styleProps: styleProps,
                tailwindPatterns: tailwindPatterns,
                dependencies: dependencies,
                styleComplexity: classNames.length + styleProps.length
            });
            
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
        }
    }

    extractClassNames(content) {
        const classNameRegex = /className\s*=\s*(?:["']([^"']+)["']|{`([^`]+)`}|{([^}]+)})/g;
        const classNames = [];
        let match;
        
        while ((match = classNameRegex.exec(content)) !== null) {
            const className = match[1] || match[2] || match[3];
            if (className && !className.includes('${')) {
                classNames.push(...className.split(/\s+/).filter(cls => cls.trim()));
            }
        }
        
        return [...new Set(classNames)];
    }

    extractStyleProps(content) {
        const propPatterns = [
            /(?:variant|color|size|fullWidth)\??\s*:\s*[^;,}]+/g,
            /interface\s+\w+Props[^{]*{([^}]*)}/g
        ];
        
        const styleProps = [];
        
        for (const pattern of propPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    // Extract prop definitions from interface
                    const props = match[1].match(/(\w+)\??\s*:\s*[^;,}]+/g);
                    if (props) {
                        styleProps.push(...props.map(prop => prop.split(':')[0].trim()));
                    }
                } else {
                    styleProps.push(match[0]);
                }
            }
        }
        
        return [...new Set(styleProps)];
    }

    analyzeTailwindPatterns(classNames) {
        const patterns = {
            spacing: classNames.filter(cls => /^(m|p)[xylrtb]?-\d+/.test(cls)),
            sizing: classNames.filter(cls => /^(w|h|min-|max-)-/.test(cls)),
            colors: classNames.filter(cls => /^(bg|text|border)-\w+-\d+/.test(cls)),
            layout: classNames.filter(cls => /^(flex|grid|block|inline|relative|absolute|fixed)/.test(cls)),
            responsive: classNames.filter(cls => /^(xs|sm|md|lg|xl|2xl):/.test(cls)),
            interactive: classNames.filter(cls => /^(hover|focus|active|disabled):/.test(cls)),
            custom: classNames.filter(cls => /^(touch-|priority-|status-|organization-)/.test(cls))
        };
        
        return patterns;
    }

    extractDependencies(content) {
        const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
        const dependencies = [];
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
            const dep = match[1];
            if (dep.startsWith('./') || dep.startsWith('../')) {
                dependencies.push(dep);
            }
        }
        
        return dependencies;
    }

    async analyzeComponentUsage() {
        console.log('📊 Analyzing component usage patterns...');
        
        const allFiles = await glob('src/**/*.{tsx,jsx}', {
            ignore: ['src/components/ui-kit/**']
        });
        
        for (const file of allFiles) {
            await this.analyzeFileForUIKitUsage(file);
        }
    }

    async analyzeFileForUIKitUsage(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for ui-kit imports
            const uiKitImportRegex = /import\s+{([^}]+)}\s+from\s+['"].*ui-kit['"]|import\s+{([^}]+)}\s+from\s+['"]\.\.\/.*ui-kit.*['"]/g;
            let match;
            
            while ((match = uiKitImportRegex.exec(content)) !== null) {
                const imports = (match[1] || match[2]).split(',').map(imp => imp.trim());
                
                imports.forEach(componentName => {
                    const usage = this.componentUsage.get(componentName) || [];
                    usage.push({
                        file: filePath,
                        context: this.extractUsageContext(content, componentName)
                    });
                    this.componentUsage.set(componentName, usage);
                    
                    // Update usage count in ui-kit components
                    const component = this.uiKitComponents.get(componentName);
                    if (component) {
                        component.usageCount++;
                    }
                });
            }
        } catch (error) {
            console.error(`Error analyzing usage in ${filePath}:`, error.message);
        }
    }

    extractUsageContext(content, componentName) {
        const usageRegex = new RegExp(`<${componentName}[^>]*>`, 'g');
        const matches = content.match(usageRegex) || [];
        return matches.slice(0, 3); // First 3 usage examples
    }

    generateUIKitReport() {
        // Sort components by various metrics
        const componentsByUsage = Array.from(this.uiKitComponents.entries())
            .sort((a, b) => b[1].usageCount - a[1].usageCount);
            
        const componentsByComplexity = Array.from(this.uiKitComponents.entries())
            .sort((a, b) => b[1].styleComplexity - a[1].styleComplexity);

        const report = {
            metadata: {
                analysisDate: new Date().toISOString(),
                totalComponents: this.uiKitComponents.size,
                totalUsages: Array.from(this.componentUsage.values()).reduce((sum, usages) => sum + usages.length, 0)
            },
            mostUsedComponents: componentsByUsage.slice(0, 15).map(([name, data]) => ({
                name,
                usageCount: data.usageCount,
                styleComplexity: data.styleComplexity,
                module: data.module
            })),
            mostComplexComponents: componentsByComplexity.slice(0, 15).map(([name, data]) => ({
                name,
                styleComplexity: data.styleComplexity,
                classNameCount: data.classNames?.length || 0,
                propsCount: data.styleProps?.length || 0,
                usageCount: data.usageCount
            })),
            componentDetails: Object.fromEntries(this.uiKitComponents),
            usagePatterns: Object.fromEntries(this.componentUsage),
            stylePatternAnalysis: this.analyzeOverallPatterns()
        };

        return report;
    }

    analyzeOverallPatterns() {
        const allPatterns = {
            spacing: [],
            sizing: [],
            colors: [],
            layout: [],
            responsive: [],
            interactive: [],
            custom: []
        };

        for (const [name, component] of this.uiKitComponents) {
            if (component.tailwindPatterns) {
                for (const [pattern, classes] of Object.entries(component.tailwindPatterns)) {
                    allPatterns[pattern].push(...classes);
                }
            }
        }

        // Count frequencies
        const patternFrequencies = {};
        for (const [pattern, classes] of Object.entries(allPatterns)) {
            const freq = {};
            classes.forEach(cls => {
                freq[cls] = (freq[cls] || 0) + 1;
            });
            patternFrequencies[pattern] = Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
        }

        return patternFrequencies;
    }

    async saveReport(report) {
        const outputFile = 'ui-kit-analysis.json';
        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
        
        console.log(`\n✅ UI Kit analysis complete! Report saved to ${outputFile}`);
        console.log('\n📊 UI Kit Summary:');
        console.log(`- Total components: ${report.metadata.totalComponents}`);
        console.log(`- Total usages tracked: ${report.metadata.totalUsages}`);
        
        console.log('\n🔥 Most used components:');
        report.mostUsedComponents.slice(0, 5).forEach((comp, index) => {
            console.log(`${index + 1}. ${comp.name} - ${comp.usageCount} usages`);
        });
        
        console.log('\n🎨 Most complex components (styling):');
        report.mostComplexComponents.slice(0, 5).forEach((comp, index) => {
            console.log(`${index + 1}. ${comp.name} - complexity: ${comp.styleComplexity}`);
        });
    }
}

// Run the analysis
const mapper = new UIKitMapper();
const report = await mapper.analyzeUIKit();
await mapper.saveReport(report);

export default UIKitMapper;