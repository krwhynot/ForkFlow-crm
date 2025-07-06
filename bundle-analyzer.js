#!/usr/bin/env node

/**
 * CSS Bundle Analysis for ForkFlow CRM
 * Analyzes CSS bundle size impact and identifies optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BundleAnalyzer {
    constructor() {
        this.analysis = {
            buildStats: null,
            cssFiles: [],
            bundleSize: {},
            recommendations: []
        };
    }

    async analyzeCSSBundle() {
        console.log('🔍 Analyzing CSS bundle impact...');
        
        try {
            // Build the project first
            await this.buildProject();
            
            // Analyze bundle contents
            await this.analyzeBundleContents();
            
            // Analyze Tailwind usage
            await this.analyzeTailwindUsage();
            
            // Generate recommendations
            this.generateRecommendations();
            
            return this.generateBundleReport();
        } catch (error) {
            console.error('Bundle analysis failed:', error.message);
            return this.generateErrorReport(error);
        }
    }

    async buildProject() {
        console.log('🏗️ Building project for bundle analysis...');
        
        try {
            const { stdout, stderr } = await execAsync('npm run build');
            console.log('✅ Build completed successfully');
            
            this.analysis.buildStats = {
                success: true,
                timestamp: new Date().toISOString(),
                output: stdout.split('\n').slice(-10) // Last 10 lines
            };
        } catch (error) {
            console.log('⚠️ Build failed, analyzing existing dist/build directory');
            this.analysis.buildStats = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async analyzeBundleContents() {
        console.log('📦 Analyzing bundle contents...');
        
        // Check for common build directories
        const buildDirs = ['dist', 'build', 'lib'];
        let bundleDir = null;
        
        for (const dir of buildDirs) {
            if (fs.existsSync(dir)) {
                bundleDir = dir;
                break;
            }
        }
        
        if (!bundleDir) {
            console.log('⚠️ No build directory found, analyzing source instead');
            bundleDir = 'src';
        }
        
        await this.analyzeCSSFiles(bundleDir);
        await this.calculateBundleSizes(bundleDir);
    }

    async analyzeCSSFiles(directory) {
        const cssFiles = this.findCSSFiles(directory);
        
        for (const file of cssFiles) {
            const analysis = await this.analyzeCSSFile(file);
            this.analysis.cssFiles.push(analysis);
        }
        
        console.log(`📄 Analyzed ${cssFiles.length} CSS files`);
    }

    findCSSFiles(directory, files = []) {
        if (!fs.existsSync(directory)) return files;
        
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                this.findCSSFiles(fullPath, files);
            } else if (entry.isFile() && /\.(css|scss|sass)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async analyzeCSSFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        
        return {
            path: filePath,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            lines: content.split('\n').length,
            rules: this.countCSSRules(content),
            selectors: this.extractCSSSelectors(content),
            imports: this.extractCSSImports(content),
            mediaQueries: this.extractMediaQueries(content)
        };
    }

    countCSSRules(content) {
        // Count CSS rules (rough estimation)
        const rules = content.match(/[^{}]*{[^{}]*}/g) || [];
        return rules.length;
    }

    extractCSSSelectors(content) {
        // Extract CSS selectors
        const selectorMatches = content.match(/([^{}]+){/g) || [];
        return selectorMatches.map(match => match.replace('{', '').trim()).slice(0, 10); // First 10
    }

    extractCSSImports(content) {
        const importMatches = content.match(/@import\s+[^;]+;/g) || [];
        return importMatches;
    }

    extractMediaQueries(content) {
        const mediaMatches = content.match(/@media[^{]+/g) || [];
        return mediaMatches;
    }

    async calculateBundleSizes(directory) {
        try {
            const { stdout } = await execAsync(`find ${directory} -name "*.css" -o -name "*.js" | xargs ls -la | awk '{sum += $5} END {print sum}'`);
            const totalSize = parseInt(stdout.trim()) || 0;
            
            this.analysis.bundleSize = {
                totalBytes: totalSize,
                totalKB: (totalSize / 1024).toFixed(2),
                totalMB: (totalSize / (1024 * 1024)).toFixed(2),
                cssFiles: this.analysis.cssFiles.length,
                avgCSSSize: this.analysis.cssFiles.length > 0 
                    ? (this.analysis.cssFiles.reduce((sum, f) => sum + f.size, 0) / this.analysis.cssFiles.length / 1024).toFixed(2)
                    : 0
            };
        } catch (error) {
            console.log('⚠️ Could not calculate precise bundle sizes');
            this.analysis.bundleSize = {
                error: error.message,
                estimatedFromFiles: this.analysis.cssFiles.reduce((sum, f) => sum + f.size, 0)
            };
        }
    }

    async analyzeTailwindUsage() {
        console.log('🎨 Analyzing Tailwind CSS usage efficiency...');
        
        try {
            // Load the Tailwind analysis if it exists
            if (fs.existsSync('tailwind-analysis.json')) {
                const tailwindData = JSON.parse(fs.readFileSync('tailwind-analysis.json', 'utf8'));
                
                this.analysis.tailwindUsage = {
                    totalClasses: tailwindData.metadata.uniqueClasses,
                    totalInstances: tailwindData.metadata.totalClassInstances,
                    topClasses: tailwindData.topClasses.slice(0, 20),
                    utilizationRate: this.calculateTailwindUtilization(tailwindData),
                    patternAnalysis: tailwindData.patternAnalysis
                };
            }
        } catch (error) {
            console.log('⚠️ Could not load Tailwind analysis data');
        }
    }

    calculateTailwindUtilization(tailwindData) {
        // Estimate Tailwind utilization based on class variety and usage
        const totalClasses = tailwindData.metadata.uniqueClasses;
        const totalInstances = tailwindData.metadata.totalClassInstances;
        
        // Calculate distribution efficiency (how well-distributed class usage is)
        const topClassUsage = tailwindData.topClasses.slice(0, 10).reduce((sum, cls) => sum + cls.usage, 0);
        const concentration = (topClassUsage / totalInstances * 100).toFixed(2);
        
        return {
            classVariety: totalClasses,
            averageUsagePerClass: (totalInstances / totalClasses).toFixed(2),
            topClassConcentration: concentration + '%',
            efficiency: totalClasses > 100 && concentration < 50 ? 'Good' : 'Could be improved'
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // CSS file size recommendations
        const largeCSSFiles = this.analysis.cssFiles.filter(f => f.size > 50 * 1024); // > 50KB
        if (largeCSSFiles.length > 0) {
            recommendations.push({
                type: 'CSS File Size',
                severity: 'Medium',
                issue: `${largeCSSFiles.length} CSS files are larger than 50KB`,
                files: largeCSSFiles.map(f => f.path),
                solution: 'Consider splitting large CSS files or removing unused styles'
            });
        }
        
        // Tailwind usage recommendations
        if (this.analysis.tailwindUsage) {
            const utilization = this.analysis.tailwindUsage.utilizationRate;
            
            if (parseFloat(utilization.topClassConcentration) > 60) {
                recommendations.push({
                    type: 'Tailwind Usage',
                    severity: 'Low',
                    issue: 'High concentration of usage in top classes',
                    solution: 'Consider creating component utilities for frequently used class combinations'
                });
            }
            
            if (this.analysis.tailwindUsage.totalClasses > 1000) {
                recommendations.push({
                    type: 'Tailwind Purging',
                    severity: 'Medium',
                    issue: `Using ${this.analysis.tailwindUsage.totalClasses} unique Tailwind classes`,
                    solution: 'Ensure Tailwind purging is properly configured to remove unused classes'
                });
            }
        }
        
        // Import recommendations
        const filesWithManyImports = this.analysis.cssFiles.filter(f => f.imports.length > 5);
        if (filesWithManyImports.length > 0) {
            recommendations.push({
                type: 'CSS Imports',
                severity: 'Low',
                issue: 'Multiple CSS files have many @import statements',
                solution: 'Consider bundling imports to reduce HTTP requests'
            });
        }
        
        this.analysis.recommendations = recommendations;
    }

    generateBundleReport() {
        return {
            metadata: {
                analysisDate: new Date().toISOString(),
                buildSuccess: this.analysis.buildStats?.success || false,
                analyzedFiles: this.analysis.cssFiles.length
            },
            bundleSize: this.analysis.bundleSize,
            cssFiles: this.analysis.cssFiles.map(f => ({
                path: f.path,
                sizeKB: f.sizeKB,
                rules: f.rules,
                imports: f.imports.length,
                mediaQueries: f.mediaQueries.length
            })),
            tailwindUsage: this.analysis.tailwindUsage,
            recommendations: this.analysis.recommendations,
            performanceImpact: this.assessPerformanceImpact()
        };
    }

    generateErrorReport(error) {
        return {
            metadata: {
                analysisDate: new Date().toISOString(),
                success: false,
                error: error.message
            },
            fallbackAnalysis: {
                message: 'Limited analysis performed due to build issues',
                recommendations: [
                    {
                        type: 'Build Issue',
                        severity: 'High',
                        issue: 'Could not complete full bundle analysis',
                        solution: 'Fix build issues and re-run analysis'
                    }
                ]
            }
        };
    }

    assessPerformanceImpact() {
        const totalCSSSize = this.analysis.cssFiles.reduce((sum, f) => sum + f.size, 0);
        const totalKB = totalCSSSize / 1024;
        
        let impact = 'Low';
        if (totalKB > 200) impact = 'High';
        else if (totalKB > 100) impact = 'Medium';
        
        return {
            totalCSSSize: totalKB.toFixed(2) + ' KB',
            impact: impact,
            loadTimeEstimate: this.estimateLoadTime(totalKB),
            optimizationPotential: this.estimateOptimizationPotential()
        };
    }

    estimateLoadTime(sizeKB) {
        // Rough estimates for different connection speeds
        const speeds = {
            '3G': (sizeKB / 50).toFixed(1) + 's', // ~50 KB/s
            '4G': (sizeKB / 500).toFixed(1) + 's', // ~500 KB/s
            'WiFi': (sizeKB / 2000).toFixed(1) + 's' // ~2 MB/s
        };
        return speeds;
    }

    estimateOptimizationPotential() {
        let potential = 'Low';
        
        const hasLargeFiles = this.analysis.cssFiles.some(f => f.size > 100 * 1024);
        const hasManyClasses = this.analysis.tailwindUsage?.totalClasses > 800;
        
        if (hasLargeFiles && hasManyClasses) potential = 'High';
        else if (hasLargeFiles || hasManyClasses) potential = 'Medium';
        
        return potential;
    }

    async saveReport(report) {
        const outputFile = 'bundle-analysis.json';
        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
        
        console.log(`\n✅ Bundle analysis complete! Report saved to ${outputFile}`);
        console.log('\n📊 Bundle Summary:');
        
        if (report.bundleSize.totalKB) {
            console.log(`- Total bundle size: ${report.bundleSize.totalKB} KB`);
            console.log(`- CSS files analyzed: ${report.bundleSize.cssFiles}`);
            console.log(`- Average CSS file size: ${report.bundleSize.avgCSSSize} KB`);
        }
        
        if (report.tailwindUsage) {
            console.log(`- Tailwind classes used: ${report.tailwindUsage.totalClasses}`);
            console.log(`- Utilization efficiency: ${report.tailwindUsage.utilizationRate.efficiency}`);
        }
        
        console.log(`\n⚠️ Recommendations: ${report.recommendations.length}`);
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.severity}] ${rec.type}: ${rec.issue}`);
        });
    }
}

// Run the analysis
const analyzer = new BundleAnalyzer();
const report = await analyzer.analyzeCSSBundle();
await analyzer.saveReport(report);

export default BundleAnalyzer;