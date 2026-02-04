#!/usr/bin/env node

/**
 * Auth Kit UI - Module Compliance Check
 * 
 * Validates the module against production readiness criteria:
 * - Testing (coverage, structure, passing tests)
 * - Documentation (JSDoc, README, examples, guides)
 * - Build (success, warnings, TypeScript)
 * - Code Quality (linting, formatting)
 * - Module Structure (exports, architecture)
 * - Versioning (changesets, CHANGELOG)
 * - Security (no secrets, validation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Scoring constants
const WEIGHTS = {
  testing: 30,
  documentation: 25,
  build: 15,
  codeQuality: 10,
  structure: 10,
  versioning: 5,
  security: 5,
};

const results = {
  testing: { score: 0, max: 100, checks: [] },
  documentation: { score: 0, max: 100, checks: [] },
  build: { score: 0, max: 100, checks: [] },
  codeQuality: { score: 0, max: 100, checks: [] },
  structure: { score: 0, max: 100, checks: [] },
  versioning: { score: 0, max: 100, checks: [] },
  security: { score: 0, max: 100, checks: [] },
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPass(category, points, message) {
  results[category].score += points;
  results[category].checks.push({ status: 'PASS', points, message });
  log(`  ✅ ${message}`, 'green');
}

function checkFail(category, points, message) {
  results[category].checks.push({ status: 'FAIL', points, message });
  log(`  ❌ ${message}`, 'red');
}

function checkWarn(category, points, message) {
  results[category].score += points * 0.5; // Half credit for warnings
  results[category].checks.push({ status: 'WARN', points, message });
  log(`  ⚠️  ${message}`, 'yellow');
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch {
    return null;
  }
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return error.stdout || error.stderr || '';
  }
}

// ============================================================================
// TESTING CHECKS
// ============================================================================
function checkTesting() {
  log('\n📊 Testing Compliance', 'cyan');
  
  // Check test structure (test/ mirrors src/)
  if (fs.existsSync('test') && fs.existsSync('src')) {
    checkPass('testing', 15, 'Test directory structure exists (test/ mirrors src/)');
  } else {
    checkFail('testing', 15, 'Test directory structure missing or incorrect');
  }
  
  // Check test files exist
  let testCount = 0;
  try {
    if (fs.existsSync('test')) {
      const files = fs.readdirSync('test', { recursive: true, withFileTypes: true });
      testCount = files.filter(f => f.isFile() && (f.name.endsWith('.test.ts') || f.name.endsWith('.test.tsx'))).length;
    }
  } catch (e) {
    testCount = 0;
  }
  
  if (testCount >= 10) {
    checkPass('testing', 15, `Sufficient test files (${testCount} files)`);
  } else if (testCount > 0) {
    checkWarn('testing', 15, `Limited test files (${testCount} files, recommend 10+)`);
  } else {
    checkFail('testing', 15, 'No test files found');
  }
  
  // Check coverage
  const coverageFile = readFile('coverage/coverage-summary.json');
  if (coverageFile) {
    try {
      const coverage = JSON.parse(coverageFile);
      const total = coverage.total;
      const avgCoverage = (
        total.statements.pct +
        total.branches.pct +
        total.functions.pct +
        total.lines.pct
      ) / 4;
      
      if (avgCoverage >= 80) {
        checkPass('testing', 30, `Excellent coverage (${avgCoverage.toFixed(2)}%)`);
      } else if (avgCoverage >= 60) {
        checkWarn('testing', 30, `Adequate coverage (${avgCoverage.toFixed(2)}%, target 80%)`);
      } else {
        checkFail('testing', 30, `Insufficient coverage (${avgCoverage.toFixed(2)}%, target 80%)`);
      }
    } catch (e) {
      checkFail('testing', 30, 'Coverage report unreadable');
    }
  } else {
    checkFail('testing', 30, 'Coverage report not found (run: npm run test:cov)');
  }
  
  // Check tests pass
  const testResult = runCommand('npm test 2>&1');
  if (testResult.includes('Test Suites:') && !testResult.includes('failed')) {
    checkPass('testing', 20, 'All tests passing');
  } else {
    checkFail('testing', 20, 'Tests failing or not run');
  }
  
  // Vitest config check
  if (fileExists('vitest.config.ts')) {
    checkPass('testing', 10, 'Vitest configuration present');
  } else {
    checkFail('testing', 10, 'Vitest configuration missing');
  }
  
  // Test utilities check
  if (fileExists('test/setup.ts') || fileExists('test/mocks.ts')) {
    checkPass('testing', 10, 'Test utilities present (setup/mocks)');
  } else {
    checkWarn('testing', 10, 'Test utilities missing (setup.ts, mocks.ts)');
  }
}

// ============================================================================
// DOCUMENTATION CHECKS
// ============================================================================
function checkDocumentation() {
  log('\n📚 Documentation Compliance', 'cyan');
  
  // README quality check
  const readme = readFile('README.md');
  if (readme) {
    const hasInstall = readme.includes('Installation') || readme.includes('npm install');
    const hasUsage = readme.includes('Usage') || readme.includes('Quick Start');
    const hasAPI = readme.includes('API') || readme.includes('Reference');
    const hasExamples = readme.includes('Examples') || readme.includes('example');
    
    const score = [hasInstall, hasUsage, hasAPI, hasExamples].filter(Boolean).length * 7.5;
    
    if (score === 30) {
      checkPass('documentation', 30, 'README comprehensive (install, usage, API, examples)');
    } else if (score >= 15) {
      checkWarn('documentation', 30, `README adequate (${score}/30 points)`);
    } else {
      checkFail('documentation', 30, `README incomplete (${score}/30 points)`);
    }
  } else {
    checkFail('documentation', 30, 'README.md not found');
  }
  
  // Examples directory check
  if (fs.existsSync('examples') && fs.readdirSync('examples').length > 0) {
    const exampleCount = fs.readdirSync('examples').filter(f => f.endsWith('.tsx')).length;
    if (exampleCount >= 3) {
      checkPass('documentation', 20, `Rich examples directory (${exampleCount} examples)`);
    } else if (exampleCount > 0) {
      checkWarn('documentation', 20, `Limited examples (${exampleCount}, recommend 3+)`);
    }
  } else {
    checkFail('documentation', 20, 'examples/ directory missing or empty');
  }
  
  // Backend integration guide check
  if (fileExists('docs/BACKEND_INTEGRATION.md')) {
    const guide = readFile('docs/BACKEND_INTEGRATION.md');
    if (guide && guide.length > 1000) {
      checkPass('documentation', 15, 'Backend integration guide comprehensive');
    } else {
      checkWarn('documentation', 15, 'Backend integration guide exists but brief');
    }
  } else {
    checkFail('documentation', 15, 'docs/BACKEND_INTEGRATION.md missing');
  }
  
  // Architecture documentation check
  if (fileExists('docs/ARCHITECTURE.md')) {
    checkPass('documentation', 10, 'Architecture documentation present');
  } else {
    checkFail('documentation', 10, 'docs/ARCHITECTURE.md missing');
  }
  
  // JSDoc check (sample from index.ts)
  const indexFile = readFile('src/index.ts');
  if (indexFile) {
    const jsdocCount = (indexFile.match(/\/\*\*/g) || []).length;
    if (jsdocCount >= 3) {
      checkPass('documentation', 15, `JSDoc present in exports (${jsdocCount} blocks)`);
    } else if (jsdocCount > 0) {
      checkWarn('documentation', 15, `Limited JSDoc (${jsdocCount} blocks, recommend 3+)`);
    } else {
      checkFail('documentation', 15, 'JSDoc missing in src/index.ts');
    }
  } else {
    checkFail('documentation', 15, 'src/index.ts not found');
  }
  
  // CHANGELOG check
  if (fileExists('CHANGELOG.md')) {
    checkPass('documentation', 10, 'CHANGELOG.md present');
  } else {
    checkWarn('documentation', 10, 'CHANGELOG.md missing (auto-generated by changesets)');
  }
}

// ============================================================================
// BUILD CHECKS
// ============================================================================
function checkBuild() {
  log('\n🔨 Build Compliance', 'cyan');
  
  // TypeScript compilation check
  const tscResult = runCommand('npx tsc --noEmit 2>&1');
  if (!tscResult.includes('error TS')) {
    checkPass('build', 30, 'TypeScript compilation successful (strict mode)');
  } else {
    const errorCount = (tscResult.match(/error TS/g) || []).length;
    checkFail('build', 30, `TypeScript errors present (${errorCount} errors)`);
  }
  
  // Build output check
  if (fileExists('dist/index.js') && fileExists('dist/index.d.ts')) {
    checkPass('build', 30, 'Build artifacts present (dist/index.js, dist/index.d.ts)');
  } else {
    checkFail('build', 30, 'Build artifacts missing (run: npm run build)');
  }
  
  // Vite config check (for library mode)
  const viteConfig = readFile('vite.config.ts');
  if (viteConfig) {
    const hasLibMode = viteConfig.includes('lib:');
    const hasGlobals = viteConfig.includes('output') && viteConfig.includes('globals');
    
    if (hasLibMode && hasGlobals) {
      checkPass('build', 20, 'Vite configured correctly (lib mode + globals)');
    } else if (hasLibMode) {
      checkWarn('build', 20, 'Vite lib mode present, but globals may be missing');
    } else {
      checkFail('build', 20, 'Vite library mode not configured');
    }
  } else {
    checkFail('build', 20, 'vite.config.ts not found');
  }
  
  // Package.json exports check
  const packageJson = JSON.parse(readFile('package.json'));
  if (packageJson.main && packageJson.types) {
    checkPass('build', 20, 'Package.json exports configured (main, types)');
  } else {
    checkFail('build', 20, 'Package.json exports incomplete');
  }
}

// ============================================================================
// CODE QUALITY CHECKS
// ============================================================================
function checkCodeQuality() {
  log('\n🎨 Code Quality Compliance', 'cyan');
  
  // ESLint check
  if (fileExists('eslint.config.js')) {
    const lintResult = runCommand('npm run lint 2>&1');
    if (!lintResult.includes('error') && !lintResult.includes('warning')) {
      checkPass('codeQuality', 40, 'ESLint passing (0 warnings, 0 errors)');
    } else {
      const warnings = (lintResult.match(/warning/g) || []).length;
      const errors = (lintResult.match(/error/g) || []).length;
      checkFail('codeQuality', 40, `ESLint issues (${warnings} warnings, ${errors} errors)`);
    }
  } else {
    checkFail('codeQuality', 40, 'eslint.config.js not found');
  }
  
  // Prettier check
  if (fileExists('.prettierrc.json') || fileExists('.prettierrc')) {
    checkPass('codeQuality', 20, 'Prettier configuration present');
  } else {
    checkWarn('codeQuality', 20, 'Prettier configuration missing');
  }
  
  // TypeScript strict mode check
  const tsConfig = readFile('tsconfig.json');
  if (tsConfig && tsConfig.includes('"strict": true')) {
    checkPass('codeQuality', 40, 'TypeScript strict mode enabled');
  } else {
    checkFail('codeQuality', 40, 'TypeScript strict mode not enabled');
  }
}

// ============================================================================
// MODULE STRUCTURE CHECKS
// ============================================================================
function checkStructure() {
  log('\n🏗️  Module Structure Compliance', 'cyan');
  
  // Check exports (only hooks, providers, types)
  const indexFile = readFile('src/index.ts');
  if (indexFile) {
    const hasServices = indexFile.includes('from \'./services') || indexFile.includes('from "./services');
    const hasUtils = indexFile.includes('from \'./utils') || indexFile.includes('from "./utils');
    
    if (!hasServices && !hasUtils) {
      checkPass('structure', 30, 'Exports correct (no services/utils exposed)');
    } else {
      checkFail('structure', 30, 'Services or utils incorrectly exported');
    }
  } else {
    checkFail('structure', 30, 'src/index.ts not found');
  }
  
  // Check directory structure
  const requiredDirs = ['src/hooks', 'src/models', 'src/services', 'test'];
  const existingDirs = requiredDirs.filter(dir => fs.existsSync(dir));
  
  if (existingDirs.length === requiredDirs.length) {
    checkPass('structure', 30, 'Directory structure correct (hooks, models, services, test)');
  } else {
    const missing = requiredDirs.filter(d => !existingDirs.includes(d)).join(', ');
    checkFail('structure', 30, `Directory structure incomplete (missing: ${missing})`);
  }
  
  // Check for path aliases (should NOT be used in library)
  const tsConfig = JSON.parse(readFile('tsconfig.json'));
  if (tsConfig?.compilerOptions?.paths) {
    checkFail('structure', 20, 'Path aliases found (libraries should use relative imports)');
  } else {
    checkPass('structure', 20, 'No path aliases (correct for library)');
  }
  
  // Check hooks naming convention
  let hookFiles = [];
  try {
    if (fs.existsSync('src/hooks')) {
      hookFiles = fs.readdirSync('src/hooks').filter(f => f.endsWith('.ts'));
    }
  } catch (e) {
    hookFiles = [];
  }
  
  if (hookFiles.length > 0 && hookFiles.every(f => f.includes('use') || f === 'index.ts')) {
    checkPass('structure', 20, 'Hooks follow naming convention (use* prefix)');
  } else if (hookFiles.length > 0) {
    checkWarn('structure', 20, 'Some hooks may not follow naming convention');
  }
}

// ============================================================================
// VERSIONING CHECKS
// ============================================================================
function checkVersioning() {
  log('\n🔢 Versioning Compliance', 'cyan');
  
  // Changesets configuration check
  if (fileExists('.changeset/config.json')) {
    checkPass('versioning', 40, 'Changesets configured');
  } else {
    checkFail('versioning', 40, 'Changesets not configured');
  }
  
  // Check for changeset files
  if (fs.existsSync('.changeset')) {
    const changesetFiles = fs.readdirSync('.changeset').filter(f => f.endsWith('.md') && f !== 'README.md');
    if (changesetFiles.length > 0) {
      checkPass('versioning', 40, `Changesets present (${changesetFiles.length} files)`);
    } else {
      checkWarn('versioning', 40, 'No changeset files (OK if no changes)');
    }
  }
  
  // Semantic versioning check
  const packageJson = JSON.parse(readFile('package.json'));
  const version = packageJson.version;
  if (/^\d+\.\d+\.\d+/.test(version)) {
    checkPass('versioning', 20, `Version follows semver (${version})`);
  } else {
    checkFail('versioning', 20, `Version invalid (${version})`);
  }
}

// ============================================================================
// SECURITY CHECKS
// ============================================================================
function checkSecurity() {
  log('\n🔒 Security Compliance', 'cyan');
  
  // Check for hardcoded secrets
  let srcFiles = [];
  try {
    const getAllFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
      return files;
    };
    srcFiles = getAllFiles('src');
  } catch (e) {
    srcFiles = [];
  }
  
  let hasSecrets = false;
  for (const file of srcFiles) {
    const content = readFile(file);
    if (content) {
      if (content.match(/api[_-]?key.*=.*["'][a-zA-Z0-9]{20,}["']/i) ||
          content.match(/secret.*=.*["'][a-zA-Z0-9]{20,}["']/i) ||
          content.match(/token.*=.*["'][a-zA-Z0-9]{20,}["']/i)) {
        hasSecrets = true;
        break;
      }
    }
  }
  
  if (!hasSecrets) {
    checkPass('security', 40, 'No hardcoded secrets detected');
  } else {
    checkFail('security', 40, 'Potential hardcoded secrets found');
  }
  
  // Check for console.log (tokens shouldn't be logged)
  let hasConsoleLog = false;
  for (const file of srcFiles) {
    const content = readFile(file);
    if (content && content.includes('console.log') && !file.includes('test')) {
      hasConsoleLog = true;
      break;
    }
  }
  
  if (!hasConsoleLog) {
    checkPass('security', 30, 'No console.log in production code');
  } else {
    checkWarn('security', 30, 'console.log found (ensure no sensitive data logged)');
  }
  
  // Check for input validation (DTOs/types)
  if (fileExists('src/models') && fs.readdirSync('src/models').length > 0) {
    checkPass('security', 30, 'Type definitions present (validation layer)');
  } else {
    checkFail('security', 30, 'Type definitions missing');
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================
function generateReport() {
  log('\n' + '='.repeat(70), 'cyan');
  log('📋 COMPLIANCE REPORT SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  
  let totalScore = 0;
  let maxPossible = 0;
  
  for (const [category, data] of Object.entries(results)) {
    const weightedScore = (data.score / data.max) * WEIGHTS[category];
    const weightedMax = WEIGHTS[category];
    
    totalScore += weightedScore;
    maxPossible += weightedMax;
    
    const percentage = ((data.score / data.max) * 100).toFixed(1);
    const status = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️' : '❌';
    
    log(`\n${status} ${category.toUpperCase()}: ${percentage}% (${data.score}/${data.max} points, weight: ${WEIGHTS[category]}%)`, percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
  }
  
  const finalScore = ((totalScore / maxPossible) * 100).toFixed(1);
  
  log('\n' + '='.repeat(70), 'cyan');
  log(`OVERALL SCORE: ${finalScore}%`, finalScore >= 80 ? 'green' : finalScore >= 60 ? 'yellow' : 'red');
  log('='.repeat(70), 'cyan');
  
  // Grade
  let grade, status;
  if (finalScore >= 90) {
    grade = 'A+';
    status = 'PRODUCTION READY';
  } else if (finalScore >= 80) {
    grade = 'A';
    status = 'PRODUCTION READY';
  } else if (finalScore >= 70) {
    grade = 'B';
    status = 'NEEDS MINOR IMPROVEMENTS';
  } else if (finalScore >= 60) {
    grade = 'C';
    status = 'NEEDS IMPROVEMENTS';
  } else {
    grade = 'D';
    status = 'NOT PRODUCTION READY';
  }
  
  log(`\nGRADE: ${grade}`, finalScore >= 80 ? 'green' : finalScore >= 60 ? 'yellow' : 'red');
  log(`STATUS: ${status}`, finalScore >= 80 ? 'green' : finalScore >= 60 ? 'yellow' : 'red');
  
  // Write detailed report to file
  const reportPath = 'docs/COMPLIANCE_REPORT.md';
  let report = `# Auth Kit UI - Compliance Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Overall Score:** ${finalScore}%\n`;
  report += `**Grade:** ${grade}\n`;
  report += `**Status:** ${status}\n\n`;
  report += `---\n\n`;
  
  for (const [category, data] of Object.entries(results)) {
    const percentage = ((data.score / data.max) * 100).toFixed(1);
    report += `## ${category.charAt(0).toUpperCase() + category.slice(1)} (${percentage}%)\n\n`;
    
    for (const check of data.checks) {
      const icon = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
      report += `${icon} **${check.message}** (${check.points} points)\n\n`;
    }
  }
  
  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync(reportPath, report);
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'blue');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
function main() {
  log('🚀 Auth Kit UI - Module Compliance Check', 'cyan');
  log('='.repeat(70), 'cyan');
  
  checkTesting();
  checkDocumentation();
  checkBuild();
  checkCodeQuality();
  checkStructure();
  checkVersioning();
  checkSecurity();
  
  generateReport();
}

main();
