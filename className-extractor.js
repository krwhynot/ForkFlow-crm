#!/usr/bin/env node

/**
 * className Extractor for ForkFlow CRM
 * Analyzes Tailwind CSS utility usage across all TSX/JSX files
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const SRC_PATTERN = 'src/**/*.{tsx,jsx,ts,js}';
const OUTPUT_FILE = 'tailwind-analysis.json';
const EXCLUDE_PATTERNS = ['node_modules', 'dist', 'build', '.git'];

// Utility class patterns to analyze
const UTILITY_PATTERNS = {
    spacing: /^(m|p)[xylrtb]?-\d+(\.\d+)?$/,
    sizing: /^(w|h|min-w|min-h|max-w|max-h)-\d+(\.\d+)?$/,
    colors: /^(bg|text|border|ring)-\w+-\d+$/,
    layout: /^(flex|grid|block|inline|hidden|relative|absolute|fixed)$/,
    responsive: /^(xs|sm|md|lg|xl|2xl):/,
    custom: /^(touch-target|priority-|status-|metric-|organization-card|search-input|form-)/
};

class ClassNameExtractor {
    constructor() {
        this.classStats = new Map();
        this.componentStats = new Map();
        this.patternStats = new Map();
        this.fileCount = 0;
        this.totalClasses = 0;
    }

    extractClassNamesFromFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.relative(process.cwd(), filePath);
            
            // Extract className attributes with various patterns
            const classNamePatterns = [
                /className\s*=\s*["']([^"']+)["']/g,
                /className\s*=\s*{`([^`]+)`}/g,
                /className\s*=\s*{\s*["']([^"']+)["']\s*}/g,
                /className\s*=\s*{([^}]+)}/g
            ];

            const fileClasses = new Set();
            let matches = 0;

            for (const pattern of classNamePatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const classString = match[1];
                    if (classString) {
                        this.processClassString(classString, fileName);
                        // Split by spaces and filter out empty strings
                        const classes = classString.split(/\s+/).filter(cls => cls.trim().length > 0);
                        classes.forEach(cls => fileClasses.add(cls));
                        matches++;
                    }
                }
            }

            if (fileClasses.size > 0) {
                this.componentStats.set(fileName, {
                    classCount: fileClasses.size,
                    matchCount: matches,
                    classes: Array.from(fileClasses)
                });
            }

            return fileClasses.size;
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
            return 0;
        }
    }

    processClassString(classString, fileName) {
        // Handle template literals and dynamic classes
        const cleanedString = classString
            .replace(/\$\{[^}]+\}/g, '') // Remove template literal expressions
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        const classes = cleanedString.split(/\s+/).filter(cls => cls.trim().length > 0);
        
        classes.forEach(className => {
            if (className.length > 0 && !className.includes('${')) {
                // Count overall usage
                const count = this.classStats.get(className) || 0;
                this.classStats.set(className, count + 1);
                this.totalClasses++;

                // Categorize by pattern
                this.categorizeClass(className);
            }
        });
    }

    categorizeClass(className) {
        for (const [patternName, regex] of Object.entries(UTILITY_PATTERNS)) {
            if (regex.test(className)) {
                const count = this.patternStats.get(patternName) || 0;
                this.patternStats.set(patternName, count + 1);
                return; // Stop at first match
            }
        }

        // If no pattern matches, categorize as 'other'
        const count = this.patternStats.get('other') || 0;
        this.patternStats.set('other', count + 1);
    }

    analyzeFiles() {
        console.log('🔍 Extracting className usage from ForkFlow CRM...');
        
        // Find all matching files
        const files = glob.sync(SRC_PATTERN, {
            ignore: EXCLUDE_PATTERNS.map(pattern => `**/${pattern}/**`)
        });

        console.log(`📁 Found ${files.length} files to analyze`);

        // Process each file
        files.forEach(file => {
            const classCount = this.extractClassNamesFromFile(file);
            if (classCount > 0) {
                this.fileCount++;
            }
        });

        return this.generateReport();
    }

    generateReport() {
        // Sort classes by frequency
        const sortedClasses = Array.from(this.classStats.entries())
            .sort((a, b) => b[1] - a[1]);

        // Sort components by class count
        const sortedComponents = Array.from(this.componentStats.entries())
            .sort((a, b) => b[1].classCount - a[1].classCount);

        // Sort patterns by usage
        const sortedPatterns = Array.from(this.patternStats.entries())
            .sort((a, b) => b[1] - a[1]);

        const report = {
            metadata: {
                analysisDate: new Date().toISOString(),
                totalFiles: this.fileCount,
                totalClassInstances: this.totalClasses,
                uniqueClasses: this.classStats.size
            },
            topClasses: sortedClasses.slice(0, 50).map(([className, count]) => ({
                className,
                usage: count,
                percentage: ((count / this.totalClasses) * 100).toFixed(2)
            })),
            topComponents: sortedComponents.slice(0, 20).map(([file, stats]) => ({
                file,
                classCount: stats.classCount,
                matchCount: stats.matchCount,
                topClasses: stats.classes.slice(0, 10)
            })),
            patternAnalysis: sortedPatterns.map(([pattern, count]) => ({
                pattern,
                usage: count,
                percentage: ((count / this.totalClasses) * 100).toFixed(2)
            })),
            allClasses: Object.fromEntries(this.classStats),
            componentDetails: Object.fromEntries(this.componentStats)
        };

        return report;
    }

    saveReport(report) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
        console.log(`\n✅ Analysis complete! Report saved to ${OUTPUT_FILE}`);
        
        // Print summary
        console.log('\n📊 Summary:');
        console.log(`- Files analyzed: ${report.metadata.totalFiles}`);
        console.log(`- Total class instances: ${report.metadata.totalClassInstances}`);
        console.log(`- Unique classes: ${report.metadata.uniqueClasses}`);
        console.log(`- Most used class: ${report.topClasses[0]?.className} (${report.topClasses[0]?.usage} times)`);
        
        console.log('\n🔥 Top 10 Tailwind utilities:');
        report.topClasses.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. ${item.className} - ${item.usage} times (${item.percentage}%)`);
        });

        console.log('\n📁 Most style-heavy components:');
        report.topComponents.slice(0, 5).forEach((item, index) => {
            console.log(`${index + 1}. ${item.file} - ${item.classCount} unique classes`);
        });
    }
}

// Run the analysis
const extractor = new ClassNameExtractor();
const report = extractor.analyzeFiles();
extractor.saveReport(report);

export default ClassNameExtractor;