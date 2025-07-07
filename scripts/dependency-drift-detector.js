#!/usr/bin/env node

/**
 * Dependency Drift Detection Script
 * 
 * Analyzes dependency changes over time and detects architectural drift
 * Generates baseline snapshots and compares against current state
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const BASELINE_DIR = '.dependency-baselines';
const BASELINE_FILE = path.join(BASELINE_DIR, 'dependency-baseline.json');
const REPORT_FILE = 'dependency-drift-report.json';

class DependencyDriftDetector {
    constructor() {
        this.currentSnapshot = null;
        this.baseline = null;
        this.driftReport = {
            timestamp: new Date().toISOString(),
            hasChanges: false,
            violations: [],
            metrics: {},
            recommendations: []
        };
    }

    /**
     * Generate current dependency snapshot
     */
    generateCurrentSnapshot() {
        console.log('🔍 Analyzing current dependencies...');
        
        try {
            // Run dependency analysis with increased buffer size
            const analysisJson = execSync('dependency-cruiser src --output-type json', { 
                encoding: 'utf8',
                stdio: 'pipe',
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            
            const analysis = JSON.parse(analysisJson);
            
            // Extract key metrics
            const modules = analysis.modules || [];
            const dependencies = analysis.summary?.totalCruised || 0;
            
            this.currentSnapshot = {
                timestamp: new Date().toISOString(),
                totalModules: modules.length,
                totalDependencies: dependencies,
                moduleMetrics: this.calculateModuleMetrics(modules),
                couplingMatrix: this.buildCouplingMatrix(modules),
                circularDependencies: this.detectCircularDependencies(),
                architecturalCompliance: this.checkArchitecturalCompliance()
            };

            console.log(`📊 Analyzed ${this.currentSnapshot.totalModules} modules with ${this.currentSnapshot.totalDependencies} dependencies`);
            return this.currentSnapshot;
            
        } catch (error) {
            console.error('❌ Error generating dependency snapshot:', error.message);
            process.exit(1);
        }
    }

    /**
     * Calculate metrics for each module
     */
    calculateModuleMetrics(modules) {
        const metrics = {};
        
        modules.forEach(module => {
            const dependencies = module.dependencies || [];
            const dependents = module.dependents || [];
            
            metrics[module.source] = {
                inDegree: dependents.length,        // How many modules depend on this
                outDegree: dependencies.length,     // How many modules this depends on
                coupling: dependencies.length + dependents.length,
                stability: dependencies.length / (dependencies.length + dependents.length + 1),
                complexity: this.calculateComplexity(module)
            };
        });
        
        return metrics;
    }

    /**
     * Build coupling matrix between architectural layers
     */
    buildCouplingMatrix(modules) {
        const layers = ['core', 'features', 'business', 'ui-kit', 'other'];
        const matrix = {};
        
        // Initialize matrix
        layers.forEach(from => {
            matrix[from] = {};
            layers.forEach(to => {
                matrix[from][to] = 0;
            });
        });
        
        // Count dependencies between layers
        modules.forEach(module => {
            const fromLayer = this.getModuleLayer(module.source);
            
            (module.dependencies || []).forEach(dep => {
                const toLayer = this.getModuleLayer(dep.resolved);
                matrix[fromLayer][toLayer]++;
            });
        });
        
        return matrix;
    }

    /**
     * Determine which architectural layer a module belongs to
     */
    getModuleLayer(modulePath) {
        if (modulePath.includes('/components/core/')) return 'core';
        if (modulePath.includes('/components/features/')) return 'features';
        if (modulePath.includes('/components/business/')) return 'business';
        if (modulePath.includes('/components/ui-kit/')) return 'ui-kit';
        return 'other';
    }

    /**
     * Calculate module complexity
     */
    calculateComplexity(module) {
        // Simple complexity based on dependencies and file size
        const dependencies = (module.dependencies || []).length;
        const dependents = (module.dependents || []).length;
        return Math.sqrt(dependencies * dependents);
    }

    /**
     * Detect circular dependencies
     */
    detectCircularDependencies() {
        try {
            const circularOutput = execSync('madge --circular --extensions ts,tsx src/', { 
                encoding: 'utf8',
                stdio: 'pipe',
                maxBuffer: 1024 * 1024 * 5 // 5MB buffer
            });
            
            // Parse madge output
            const lines = circularOutput.split('\n').filter(line => line.trim());
            return lines.length > 1 ? lines.slice(1) : []; // Skip header
            
        } catch (error) {
            // Madge exits with non-zero when no circular deps found
            return [];
        }
    }

    /**
     * Check architectural compliance
     */
    checkArchitecturalCompliance() {
        try {
            const validationOutput = execSync('dependency-cruiser src --validate', { 
                encoding: 'utf8',
                stdio: 'pipe',
                maxBuffer: 1024 * 1024 * 5 // 5MB buffer
            });
            
            // Parse violations from output
            const violations = [];
            const lines = validationOutput.split('\n');
            
            lines.forEach(line => {
                if (line.includes('error') || line.includes('warn')) {
                    violations.push(line.trim());
                }
            });
            
            return {
                compliant: violations.length === 0,
                violations: violations,
                violationCount: violations.length
            };
            
        } catch (error) {
            return {
                compliant: false,
                violations: [error.message],
                violationCount: 1
            };
        }
    }

    /**
     * Load baseline snapshot
     */
    loadBaseline() {
        if (existsSync(BASELINE_FILE)) {
            try {
                const baselineData = readFileSync(BASELINE_FILE, 'utf8');
                this.baseline = JSON.parse(baselineData);
                console.log(`📋 Loaded baseline from ${new Date(this.baseline.timestamp).toLocaleDateString()}`);
                return true;
            } catch (error) {
                console.error('❌ Error loading baseline:', error.message);
                return false;
            }
        }
        return false;
    }

    /**
     * Save current snapshot as baseline
     */
    saveBaseline() {
        try {
            // Ensure directory exists
            execSync(`mkdir -p ${BASELINE_DIR}`, { stdio: 'pipe' });
            
            writeFileSync(BASELINE_FILE, JSON.stringify(this.currentSnapshot, null, 2));
            console.log(`💾 Saved new baseline to ${BASELINE_FILE}`);
        } catch (error) {
            console.error('❌ Error saving baseline:', error.message);
        }
    }

    /**
     * Compare current snapshot with baseline
     */
    compareDependencies() {
        if (!this.baseline) {
            console.log('📋 No baseline found. Current snapshot will be saved as baseline.');
            this.saveBaseline();
            return;
        }

        console.log('🔄 Comparing with baseline...');

        // Compare high-level metrics
        this.compareMetrics();
        
        // Compare coupling matrix
        this.compareCouplingMatrix();
        
        // Compare architectural compliance
        this.compareCompliance();
        
        // Detect significant changes
        this.detectSignificantChanges();
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Save drift report
        this.saveDriftReport();
    }

    /**
     * Compare high-level metrics
     */
    compareMetrics() {
        const current = this.currentSnapshot;
        const baseline = this.baseline;
        
        const metrics = {
            moduleCountChange: current.totalModules - baseline.totalModules,
            dependencyCountChange: current.totalDependencies - baseline.totalDependencies,
            averageCouplingChange: this.calculateAverageCouplingChange(),
            complexityChange: this.calculateComplexityChange()
        };
        
        this.driftReport.metrics = metrics;
        
        // Check for significant changes
        if (Math.abs(metrics.moduleCountChange) > 5) {
            this.driftReport.violations.push({
                type: 'module-count-change',
                severity: 'warning',
                message: `Module count changed by ${metrics.moduleCountChange} (${baseline.totalModules} → ${current.totalModules})`
            });
        }
        
        if (Math.abs(metrics.dependencyCountChange) > 50) {
            this.driftReport.violations.push({
                type: 'dependency-count-change',
                severity: 'warning',
                message: `Dependency count changed by ${metrics.dependencyCountChange} (${baseline.totalDependencies} → ${current.totalDependencies})`
            });
        }
    }

    /**
     * Compare coupling matrix for architectural drift
     */
    compareCouplingMatrix() {
        const current = this.currentSnapshot.couplingMatrix;
        const baseline = this.baseline.couplingMatrix;
        
        // Check for new architectural violations
        const violations = [];
        
        // Core components should not depend on features or business
        if (current.core.features > baseline.core.features) {
            violations.push({
                type: 'architectural-violation',
                severity: 'error',
                message: `Core components now depend on ${current.core.features} feature components (was ${baseline.core.features})`
            });
        }
        
        if (current.core.business > baseline.core.business) {
            violations.push({
                type: 'architectural-violation',
                severity: 'error',
                message: `Core components now depend on ${current.core.business} business components (was ${baseline.core.business})`
            });
        }
        
        // Features should not depend on business
        if (current.features.business > baseline.features.business) {
            violations.push({
                type: 'architectural-violation',
                severity: 'error',
                message: `Feature components now depend on ${current.features.business} business components (was ${baseline.features.business})`
            });
        }
        
        this.driftReport.violations.push(...violations);
    }

    /**
     * Compare architectural compliance
     */
    compareCompliance() {
        const current = this.currentSnapshot.architecturalCompliance;
        const baseline = this.baseline.architecturalCompliance;
        
        if (current.violationCount > baseline.violationCount) {
            this.driftReport.violations.push({
                type: 'compliance-regression',
                severity: 'error',
                message: `Architectural violations increased from ${baseline.violationCount} to ${current.violationCount}`
            });
        }
        
        // Check for new circular dependencies
        if (this.currentSnapshot.circularDependencies.length > this.baseline.circularDependencies.length) {
            this.driftReport.violations.push({
                type: 'circular-dependency',
                severity: 'error',
                message: `New circular dependencies detected: ${this.currentSnapshot.circularDependencies.length - this.baseline.circularDependencies.length}`
            });
        }
    }

    /**
     * Detect significant changes that might indicate drift
     */
    detectSignificantChanges() {
        // Check for modules with significantly increased coupling
        const highCouplingModules = Object.entries(this.currentSnapshot.moduleMetrics)
            .filter(([path, metrics]) => {
                const baselineMetrics = this.baseline.moduleMetrics[path];
                if (!baselineMetrics) return false;
                
                return metrics.coupling > baselineMetrics.coupling * 1.5; // 50% increase
            })
            .map(([path, metrics]) => ({ path, coupling: metrics.coupling }));
        
        if (highCouplingModules.length > 0) {
            this.driftReport.violations.push({
                type: 'coupling-increase',
                severity: 'warning',
                message: `${highCouplingModules.length} modules show significant coupling increase`,
                details: highCouplingModules
            });
        }
        
        this.driftReport.hasChanges = this.driftReport.violations.length > 0;
    }

    /**
     * Generate recommendations based on detected drift
     */
    generateRecommendations() {
        const recommendations = [];
        
        this.driftReport.violations.forEach(violation => {
            switch (violation.type) {
                case 'architectural-violation':
                    recommendations.push('Review and refactor components to maintain architectural boundaries');
                    break;
                case 'circular-dependency':
                    recommendations.push('Resolve circular dependencies using dependency injection or shared services');
                    break;
                case 'coupling-increase':
                    recommendations.push('Consider breaking down high-coupling modules into smaller components');
                    break;
                case 'compliance-regression':
                    recommendations.push('Run architectural validation and fix reported violations');
                    break;
            }
        });
        
        this.driftReport.recommendations = [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Save drift report
     */
    saveDriftReport() {
        try {
            writeFileSync(REPORT_FILE, JSON.stringify(this.driftReport, null, 2));
            console.log(`📊 Drift report saved to ${REPORT_FILE}`);
        } catch (error) {
            console.error('❌ Error saving drift report:', error.message);
        }
    }

    /**
     * Calculate average coupling change
     */
    calculateAverageCouplingChange() {
        const currentCoupling = Object.values(this.currentSnapshot.moduleMetrics)
            .reduce((sum, metrics) => sum + metrics.coupling, 0) / Object.keys(this.currentSnapshot.moduleMetrics).length;
        
        const baselineCoupling = Object.values(this.baseline.moduleMetrics)
            .reduce((sum, metrics) => sum + metrics.coupling, 0) / Object.keys(this.baseline.moduleMetrics).length;
        
        return currentCoupling - baselineCoupling;
    }

    /**
     * Calculate complexity change
     */
    calculateComplexityChange() {
        const currentComplexity = Object.values(this.currentSnapshot.moduleMetrics)
            .reduce((sum, metrics) => sum + metrics.complexity, 0) / Object.keys(this.currentSnapshot.moduleMetrics).length;
        
        const baselineComplexity = Object.values(this.baseline.moduleMetrics)
            .reduce((sum, metrics) => sum + metrics.complexity, 0) / Object.keys(this.baseline.moduleMetrics).length;
        
        return currentComplexity - baselineComplexity;
    }

    /**
     * Print summary report
     */
    printSummary() {
        console.log('\n📋 Dependency Drift Detection Summary');
        console.log('=====================================');
        
        if (!this.driftReport.hasChanges) {
            console.log('✅ No significant architectural drift detected');
        } else {
            console.log(`⚠️  Detected ${this.driftReport.violations.length} issues:`);
            
            this.driftReport.violations.forEach(violation => {
                const icon = violation.severity === 'error' ? '❌' : '⚠️';
                console.log(`   ${icon} ${violation.message}`);
            });
            
            if (this.driftReport.recommendations.length > 0) {
                console.log('\n💡 Recommendations:');
                this.driftReport.recommendations.forEach(rec => {
                    console.log(`   • ${rec}`);
                });
            }
        }
        
        console.log(`\n📊 Current metrics: ${this.currentSnapshot.totalModules} modules, ${this.currentSnapshot.totalDependencies} dependencies`);
        console.log(`📅 Analysis timestamp: ${this.driftReport.timestamp}`);
    }

    /**
     * Main execution method
     */
    async run(options = {}) {
        const { updateBaseline = false } = options;
        
        // Generate current snapshot
        this.generateCurrentSnapshot();
        
        // Load existing baseline
        const hasBaseline = this.loadBaseline();
        
        if (updateBaseline || !hasBaseline) {
            this.saveBaseline();
            if (updateBaseline && hasBaseline) {
                console.log('🔄 Baseline updated with current snapshot');
            }
        } else {
            // Compare with baseline
            this.compareDependencies();
        }
        
        // Print summary
        this.printSummary();
        
        // Exit with error code if issues found
        if (this.driftReport.hasChanges && this.driftReport.violations.some(v => v.severity === 'error')) {
            process.exit(1);
        }
    }
}

// CLI handling
const args = process.argv.slice(2);
const updateBaseline = args.includes('--update-baseline') || args.includes('-u');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
Dependency Drift Detector

Usage: node dependency-drift-detector.js [options]

Options:
  -u, --update-baseline    Update the baseline with current state
  -h, --help              Show this help message

Examples:
  node dependency-drift-detector.js                  # Check for drift
  node dependency-drift-detector.js --update-baseline # Update baseline
`);
    process.exit(0);
}

// Run the detector
const detector = new DependencyDriftDetector();
detector.run({ updateBaseline }).catch(error => {
    console.error('❌ Drift detection failed:', error.message);
    process.exit(1);
});