#!/usr/bin/env node

/**
 * Component Style Complexity Analyzer
 * Identifies components with high Tailwind class usage for refactoring opportunities
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class ComponentComplexityAnalyzer {
    constructor() {
        this.results = [];
        this.classPatterns = [
            // Tailwind class patterns
            /className\s*=\s*["'`]([^"'`]+)["'`]/g,
            /className\s*=\s*{[^}]*["'`]([^"'`]+)["'`][^}]*}/g,
            // Template literal patterns
            /className\s*=\s*{`([^`]+)`}/g,
            // clsx/cn patterns
            /(?:clsx|cn|classnames)\s*\(\s*(?:["'`]([^"'`]+)["'`]|[^)]+)/g
        ];
    }

    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const classes = this.extractClasses(content);
            const classCount = classes.length;
            const uniqueClasses = [...new Set(classes)];
            
            // Analyze complexity patterns
            const complexity = this.analyzeComplexity(classes, content);
            
            return {
                file: filePath,
                classCount,
                uniqueClassCount: uniqueClasses.length,
                classes: uniqueClasses,
                complexity,
                recommendations: this.generateRecommendations(complexity, classCount)
            };
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
            return null;
        }
    }

    extractClasses(content) {
        const allClasses = [];
        
        this.classPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    // Split by spaces and filter out empty strings
                    const classes = match[1]
                        .split(/\s+/)
                        .filter(cls => cls.trim() && !cls.includes('${'))
                        .filter(cls => this.isTailwindClass(cls));
                    allClasses.push(...classes);
                }
            }
        });
        
        return allClasses;
    }

    isTailwindClass(className) {
        // Basic Tailwind class validation
        const tailwindPatterns = [
            /^(m|p)[x|y|t|r|b|l]?-/, // margin/padding
            /^(w|h|max-w|max-h|min-w|min-h)-/, // sizing
            /^(bg|text|border|ring)-/, // colors
            /^(flex|grid|block|hidden|inline)/, // display
            /^(relative|absolute|fixed|sticky)/, // position
            /^(rounded|shadow|opacity)/, // effects
            /^(font|text|leading|tracking)/, // typography
            /^(transition|duration|ease)/, // animations
            /^(sm|md|lg|xl|2xl):/, // responsive
            /^(hover|focus|active|group)/, // states
            /^(gap|space)/, // spacing
            /^(justify|items|content)/, // alignment
            /^(overflow|whitespace|cursor)/, // behavior
        ];
        
        return tailwindPatterns.some(pattern => pattern.test(className));
    }

    analyzeComplexity(classes, content) {
        return {
            duplicateClasses: this.findDuplicateClasses(classes),
            responsiveClasses: classes.filter(cls => cls.includes(':')).length,
            stateClasses: classes.filter(cls => /^(hover|focus|active|group)/.test(cls)).length,
            layoutClasses: classes.filter(cls => /^(flex|grid|block|hidden|relative|absolute)/.test(cls)).length,
            spacingClasses: classes.filter(cls => /^(m|p)[x|y|t|r|b|l]?-/.test(cls)).length,
            colorClasses: classes.filter(cls => /^(bg|text|border)-/.test(cls)).length,
            hasComplexLogic: content.includes('clsx') || content.includes('cn(') || content.includes('classnames'),
            hasConditionalClasses: /className.*\?.*:/.test(content),
            longClassStrings: this.findLongClassStrings(content)
        };
    }

    findDuplicateClasses(classes) {
        const counts = {};
        classes.forEach(cls => {
            counts[cls] = (counts[cls] || 0) + 1;
        });
        return Object.entries(counts)
            .filter(([cls, count]) => count > 1)
            .map(([cls, count]) => ({ class: cls, count }));
    }

    findLongClassStrings(content) {
        const longStrings = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            if (line.includes('className') && line.length > 120) {
                longStrings.push({
                    line: index + 1,
                    length: line.length,
                    content: line.trim().substring(0, 100) + '...'
                });
            }
        });
        
        return longStrings;
    }

    generateRecommendations(complexity, classCount) {
        const recommendations = [];
        
        if (classCount > 100) {
            recommendations.push({
                type: 'high_complexity',
                message: `Component has ${classCount} classes. Consider breaking into smaller components.`
            });
        }
        
        if (complexity.duplicateClasses.length > 5) {
            recommendations.push({
                type: 'duplicate_classes',
                message: `Found ${complexity.duplicateClasses.length} duplicate class patterns. Extract common styles.`
            });
        }
        
        if (complexity.longClassStrings.length > 0) {
            recommendations.push({
                type: 'long_strings',
                message: `Found ${complexity.longClassStrings.length} long className strings. Consider utility functions.`
            });
        }
        
        if (complexity.responsiveClasses > 20) {
            recommendations.push({
                type: 'responsive_heavy',
                message: `High responsive class usage (${complexity.responsiveClasses}). Consider component variants.`
            });
        }
        
        if (!complexity.hasComplexLogic && classCount > 50) {
            recommendations.push({
                type: 'missing_utilities',
                message: 'Consider using clsx or similar utilities for conditional styling.'
            });
        }
        
        return recommendations;
    }

    async analyze() {
        console.log('🔍 Analyzing component style complexity...\n');
        
        // Find all TSX files
        const files = await glob('src/**/*.{tsx,jsx}', {
            ignore: ['**/*.test.*', '**/*.stories.*', '**/node_modules/**']
        });
        
        console.log(`Found ${files.length} component files to analyze...\n`);
        
        // Analyze each file
        const results = files
            .map(file => this.analyzeFile(file))
            .filter(result => result !== null)
            .sort((a, b) => b.classCount - a.classCount);
        
        this.results = results;
        
        // Generate report
        this.generateReport();
        this.generateRefactoringTargets();
    }

    generateReport() {
        const highComplexity = this.results.filter(r => r.classCount > 100);
        const mediumComplexity = this.results.filter(r => r.classCount > 50 && r.classCount <= 100);
        
        console.log('📊 COMPONENT STYLE COMPLEXITY ANALYSIS');
        console.log('=====================================\n');
        
        console.log(`📈 Summary:`);
        console.log(`  • Total components analyzed: ${this.results.length}`);
        console.log(`  • High complexity (>100 classes): ${highComplexity.length}`);
        console.log(`  • Medium complexity (50-100 classes): ${mediumComplexity.length}`);
        console.log(`  • Low complexity (<50 classes): ${this.results.length - highComplexity.length - mediumComplexity.length}\n`);
        
        if (highComplexity.length > 0) {
            console.log('🚨 HIGH COMPLEXITY COMPONENTS (Priority Refactoring):');
            highComplexity.slice(0, 10).forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.file.replace('src/', '')}`);
                console.log(`     Classes: ${result.classCount} | Unique: ${result.uniqueClassCount}`);
                if (result.recommendations.length > 0) {
                    console.log(`     Recommendations: ${result.recommendations.length} issues found`);
                }
                console.log('');
            });
        }
        
        if (mediumComplexity.length > 0) {
            console.log('⚠️  MEDIUM COMPLEXITY COMPONENTS:');
            mediumComplexity.slice(0, 5).forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.file.replace('src/', '')} (${result.classCount} classes)`);
            });
            console.log('');
        }
    }

    generateRefactoringTargets() {
        const targets = this.results
            .filter(r => r.classCount > 75)
            .map(r => ({
                file: r.file,
                priority: r.classCount > 100 ? 'high' : 'medium',
                classCount: r.classCount,
                issues: r.recommendations.length,
                patterns: this.identifyPatterns(r)
            }));
        
        // Save detailed analysis
        const analysisData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalComponents: this.results.length,
                highComplexity: this.results.filter(r => r.classCount > 100).length,
                mediumComplexity: this.results.filter(r => r.classCount > 50 && r.classCount <= 100).length,
                averageClassCount: Math.round(this.results.reduce((sum, r) => sum + r.classCount, 0) / this.results.length)
            },
            refactoringTargets: targets,
            detailedResults: this.results.slice(0, 20) // Top 20 most complex
        };
        
        fs.writeFileSync(
            'component-complexity-analysis.json',
            JSON.stringify(analysisData, null, 2)
        );
        
        console.log('💾 Detailed analysis saved to component-complexity-analysis.json');
        console.log(`🎯 Identified ${targets.length} components for refactoring\n`);
        
        return targets;
    }

    identifyPatterns(result) {
        const patterns = [];
        
        // Look for common refactoring opportunities
        if (result.complexity.duplicateClasses.length > 0) {
            patterns.push('duplicate_styles');
        }
        if (result.complexity.responsiveClasses > 15) {
            patterns.push('responsive_heavy');
        }
        if (result.complexity.longClassStrings.length > 0) {
            patterns.push('long_class_strings');
        }
        if (result.complexity.layoutClasses > 20) {
            patterns.push('layout_heavy');
        }
        if (result.complexity.spacingClasses > 15) {
            patterns.push('spacing_heavy');
        }
        
        return patterns;
    }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new ComponentComplexityAnalyzer();
    analyzer.analyze().catch(console.error);
}

export default ComponentComplexityAnalyzer;