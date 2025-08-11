// frontend/tests/setup/project-config.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Project Configuration', () => {
  it('should have TypeScript configuration', () => {
    const tsconfigPath = resolve(__dirname, '../../tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.target).toBe('ES2020');
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
  });

  it('should have correct path aliases configured', () => {
    const tsconfigPath = resolve(__dirname, '../../tsconfig.json');
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@components/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@services/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@types/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@utils/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@hooks/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@store/*']).toBeDefined();
  });

  it('should have ESLint configuration', () => {
    const eslintPath = resolve(__dirname, '../../.eslintrc.json');
    const eslintConfig = JSON.parse(readFileSync(eslintPath, 'utf-8'));
    
    expect(eslintConfig.extends).toContain('eslint:recommended');
    expect(eslintConfig.extends).toContain('plugin:@typescript-eslint/recommended');
    expect(eslintConfig.extends).toContain('plugin:react-hooks/recommended');
  });

  it('should have Vite configuration with proper plugins', () => {
    const vitePath = resolve(__dirname, '../../vite.config.ts');
    const viteContent = readFileSync(vitePath, 'utf-8');
    
    expect(viteContent).toContain('react()');
    expect(viteContent).toContain('defineConfig');
    expect(viteContent).toContain('alias');
  });

  it('should have required dependencies installed', () => {
    const packagePath = resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    
    // Core dependencies
    expect(packageJson.dependencies['react']).toBeDefined();
    expect(packageJson.dependencies['react-dom']).toBeDefined();
    expect(packageJson.dependencies['react-router-dom']).toBeDefined();
    expect(packageJson.dependencies['@reduxjs/toolkit']).toBeDefined();
    expect(packageJson.dependencies['axios']).toBeDefined();
    expect(packageJson.dependencies['@tanstack/react-query']).toBeDefined();
    expect(packageJson.dependencies['react-hook-form']).toBeDefined();
    expect(packageJson.dependencies['yup']).toBeDefined();
    
    // Dev dependencies
    expect(packageJson.devDependencies['typescript']).toBeDefined();
    expect(packageJson.devDependencies['vite']).toBeDefined();
    expect(packageJson.devDependencies['vitest']).toBeDefined();
    expect(packageJson.devDependencies['@testing-library/react']).toBeDefined();
    expect(packageJson.devDependencies['@testing-library/jest-dom']).toBeDefined();
  });

  it('should have correct environment variables setup', () => {
    const envExamplePath = resolve(__dirname, '../../.env.example');
    const envContent = readFileSync(envExamplePath, 'utf-8');
    
    expect(envContent).toContain('VITE_API_URL=http://localhost:8080/api');
    expect(envContent).toContain('VITE_APP_NAME=Due Diligence Finance');
    expect(envContent).toContain('VITE_APP_VERSION=1.0.0');
  });
});
