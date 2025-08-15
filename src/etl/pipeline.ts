// ETL Pipeline Core Engine
// Orchestrates the extraction, transformation, and loading of open source data

import type { 
  ETLJob, 
  QuestionItem, 
  Source, 
  ValidationResult,
  QuestionCollection 
} from '../types/questionBank';
import type { DataSourceConfig, ETLPipelineConfig } from './config';
import { ETL_CONFIG, SOURCE_PROCESSORS, QUALITY_RULES } from './config';
import { DataExtractor } from './extractors';
import { DataTransformer } from './transformers';
import { DataLoader } from './loaders';
import { QualityValidator } from './validators';

export interface ETLMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  itemsProcessed: number;
  itemsSuccess: number;
  itemsError: number;
  itemsSkipped: number;
  errorRate: number;
  throughput: number; // items per second
  memoryUsage?: number;
  errors: string[];
  warnings: string[];
}

export interface ETLJobResult {
  success: boolean;
  job: ETLJob;
  metrics: ETLMetrics;
  outputPath?: string;
  collections?: QuestionCollection[];
  error?: string;
}

export class ETLPipeline {
  private config: ETLPipelineConfig;
  private extractor: DataExtractor;
  private transformer: DataTransformer;
  private loader: DataLoader;
  private validator: QualityValidator;
  private jobs: Map<string, ETLJob> = new Map();

  constructor(config: ETLPipelineConfig = ETL_CONFIG) {
    this.config = config;
    this.extractor = new DataExtractor(config);
    this.transformer = new DataTransformer(config);
    this.loader = new DataLoader(config);
    this.validator = new QualityValidator(QUALITY_RULES);
  }

  // Main pipeline execution
  async runPipeline(sourceNames?: string[]): Promise<ETLJobResult[]> {
    const sources = sourceNames 
      ? Object.fromEntries(
          sourceNames.map(name => [name, this.config.sources[name]]).filter(([_, config]) => config)
        )
      : Object.fromEntries(
          Object.entries(this.config.sources).filter(([_, config]) => config.enabled)
        );

    const results: ETLJobResult[] = [];

    for (const [sourceName, sourceConfig] of Object.entries(sources)) {
      try {
        const result = await this.processSource(sourceName, sourceConfig);
        results.push(result);
      } catch (error) {
        console.error(`Pipeline failed for source ${sourceName}:`, error);
        results.push({
          success: false,
          job: this.createJob('pipeline', sourceName, 'failed'),
          metrics: this.createEmptyMetrics(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Process individual source
  async processSource(sourceName: string, sourceConfig: DataSourceConfig): Promise<ETLJobResult> {
    const job = this.createJob('ingest', sourceName, 'running');
    const metrics = this.createEmptyMetrics();
    metrics.startTime = new Date();

    try {
      this.jobs.set(job.id, job);

      // Step 1: Extract data
      console.log(`[ETL] Extracting data from ${sourceName}...`);
      const rawData = await this.extractor.extract(sourceName, sourceConfig);
      
      job.itemsTotal = Array.isArray(rawData) ? rawData.length : 1;
      job.progress = 25;
      this.updateJob(job);

      // Step 2: Transform data
      console.log(`[ETL] Transforming data from ${sourceName}...`);
      const transformedData = await this.transformer.transform(sourceName, rawData, sourceConfig);
      
      job.progress = 50;
      this.updateJob(job);

      // Step 3: Validate data
      console.log(`[ETL] Validating data from ${sourceName}...`);
      const validatedData = await this.validateData(transformedData, metrics);
      
      job.progress = 75;
      this.updateJob(job);

      // Step 4: Load data
      console.log(`[ETL] Loading data from ${sourceName}...`);
      const collections = await this.loader.load(sourceName, validatedData, sourceConfig);
      
      job.progress = 100;
      job.status = 'completed';
      job.endTime = new Date().toISOString();
      job.duration = Math.round((new Date().getTime() - new Date(job.startTime).getTime()) / 1000);
      
      metrics.endTime = new Date();
      metrics.duration = job.duration;
      metrics.itemsProcessed = validatedData.length;
      metrics.throughput = metrics.duration > 0 ? metrics.itemsProcessed / metrics.duration : 0;

      this.updateJob(job);

      console.log(`[ETL] Successfully processed ${sourceName}: ${validatedData.length} items`);

      return {
        success: true,
        job,
        metrics,
        collections,
        outputPath: `./data/questionBanks/${sourceName}.json`
      };

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date().toISOString();
      job.errors = job.errors || [];
      job.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      metrics.endTime = new Date();
      metrics.errors.push(error instanceof Error ? error.message : 'Unknown error');

      this.updateJob(job);

      console.error(`[ETL] Failed to process ${sourceName}:`, error);

      return {
        success: false,
        job,
        metrics,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Validate transformed data
  private async validateData(items: QuestionItem[], metrics: ETLMetrics): Promise<QuestionItem[]> {
    const validItems: QuestionItem[] = [];
    
    for (const item of items) {
      try {
        const validation = await this.validator.validate(item);
        
        if (validation.isValid && validation.score >= this.config.processing.qualityThreshold) {
          validItems.push(item);
          metrics.itemsSuccess++;
        } else {
          metrics.itemsSkipped++;
          if (validation.errors.length > 0) {
            metrics.warnings.push(`Item ${item.id}: ${validation.errors.join(', ')}`);\n          }\n        }\n      } catch (error) {\n        metrics.itemsError++;\n        metrics.errors.push(`Validation error for item ${item.id}: ${error}`);\n      }\n    }\n\n    metrics.errorRate = metrics.itemsError / items.length;\n    return validItems;\n  }\n\n  // Job management\n  private createJob(type: ETLJob['type'], source: string, status: ETLJob['status']): ETLJob {\n    return {\n      id: `etl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n      type,\n      status,\n      source,\n      progress: 0,\n      itemsProcessed: 0,\n      itemsTotal: 0,\n      startTime: new Date().toISOString(),\n      errors: [],\n      warnings: [],\n      summary: {}\n    };\n  }\n\n  private updateJob(job: ETLJob): void {\n    this.jobs.set(job.id, { ...job });\n  }\n\n  private createEmptyMetrics(): ETLMetrics {\n    return {\n      startTime: new Date(),\n      itemsProcessed: 0,\n      itemsSuccess: 0,\n      itemsError: 0,\n      itemsSkipped: 0,\n      errorRate: 0,\n      throughput: 0,\n      errors: [],\n      warnings: []\n    };\n  }\n\n  // Pipeline management\n  async getJob(jobId: string): Promise<ETLJob | null> {\n    return this.jobs.get(jobId) || null;\n  }\n\n  async getJobs(status?: ETLJob['status']): Promise<ETLJob[]> {\n    const jobs = Array.from(this.jobs.values());\n    return status ? jobs.filter(job => job.status === status) : jobs;\n  }\n\n  async cancelJob(jobId: string): Promise<boolean> {\n    const job = this.jobs.get(jobId);\n    if (!job || job.status === 'completed' || job.status === 'failed') {\n      return false;\n    }\n\n    job.status = 'failed';\n    job.endTime = new Date().toISOString();\n    job.errors = job.errors || [];\n    job.errors.push('Job cancelled by user');\n    \n    this.updateJob(job);\n    return true;\n  }\n\n  // Health and monitoring\n  async getHealth(): Promise<{\n    status: 'healthy' | 'degraded' | 'unhealthy';\n    details: Record<string, any>;\n  }> {\n    const runningJobs = await this.getJobs('running');\n    const failedJobs = await this.getJobs('failed');\n    const totalJobs = this.jobs.size;\n    \n    const failureRate = totalJobs > 0 ? failedJobs.length / totalJobs : 0;\n    \n    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';\n    \n    if (failureRate > this.config.monitoring.alertThreshold) {\n      status = 'unhealthy';\n    } else if (runningJobs.length > this.config.processing.maxConcurrency) {\n      status = 'degraded';\n    }\n\n    return {\n      status,\n      details: {\n        totalJobs,\n        runningJobs: runningJobs.length,\n        failedJobs: failedJobs.length,\n        failureRate,\n        maxConcurrency: this.config.processing.maxConcurrency,\n        timestamp: new Date().toISOString()\n      }\n    };\n  }\n\n  async getMetrics(): Promise<{\n    totalProcessed: number;\n    successRate: number;\n    averageThroughput: number;\n    errorCount: number;\n    lastRun?: string;\n  }> {\n    const jobs = Array.from(this.jobs.values());\n    const completedJobs = jobs.filter(job => job.status === 'completed');\n    \n    const totalProcessed = completedJobs.reduce((sum, job) => sum + job.itemsProcessed, 0);\n    const successRate = jobs.length > 0 ? completedJobs.length / jobs.length : 0;\n    const errorCount = jobs.reduce((sum, job) => sum + (job.errors?.length || 0), 0);\n    \n    const averageThroughput = completedJobs.length > 0 \n      ? completedJobs.reduce((sum, job) => {\n          const duration = job.duration || 1;\n          return sum + (job.itemsProcessed / duration);\n        }, 0) / completedJobs.length\n      : 0;\n    \n    const lastRun = jobs.length > 0 \n      ? jobs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0].startTime\n      : undefined;\n\n    return {\n      totalProcessed,\n      successRate,\n      averageThroughput,\n      errorCount,\n      lastRun\n    };\n  }\n\n  // Utility methods\n  async clearJobs(): Promise<void> {\n    this.jobs.clear();\n  }\n\n  async retryFailedJobs(): Promise<ETLJobResult[]> {\n    const failedJobs = await this.getJobs('failed');\n    const results: ETLJobResult[] = [];\n\n    for (const job of failedJobs) {\n      const sourceConfig = this.config.sources[job.source];\n      if (sourceConfig) {\n        const result = await this.processSource(job.source, sourceConfig);\n        results.push(result);\n      }\n    }\n\n    return results;\n  }\n\n  // Configuration management\n  updateConfig(newConfig: Partial<ETLPipelineConfig>): void {\n    this.config = { ...this.config, ...newConfig };\n    \n    // Reinitialize components with new config\n    this.extractor = new DataExtractor(this.config);\n    this.transformer = new DataTransformer(this.config);\n    this.loader = new DataLoader(this.config);\n  }\n\n  getConfig(): ETLPipelineConfig {\n    return { ...this.config };\n  }\n\n  // Source management\n  async testSource(sourceName: string): Promise<{\n    success: boolean;\n    responseTime: number;\n    size?: number;\n    error?: string;\n  }> {\n    const sourceConfig = this.config.sources[sourceName];\n    if (!sourceConfig) {\n      return {\n        success: false,\n        responseTime: 0,\n        error: 'Source not found'\n      };\n    }\n\n    const startTime = Date.now();\n    \n    try {\n      const response = await fetch(sourceConfig.url, { method: 'HEAD' });\n      const responseTime = Date.now() - startTime;\n      \n      if (!response.ok) {\n        return {\n          success: false,\n          responseTime,\n          error: `HTTP ${response.status}: ${response.statusText}`\n        };\n      }\n\n      const contentLength = response.headers.get('content-length');\n      const size = contentLength ? parseInt(contentLength, 10) : undefined;\n\n      return {\n        success: true,\n        responseTime,\n        size\n      };\n    } catch (error) {\n      return {\n        success: false,\n        responseTime: Date.now() - startTime,\n        error: error instanceof Error ? error.message : 'Unknown error'\n      };\n    }\n  }\n\n  async validateSources(): Promise<Record<string, { valid: boolean; errors: string[] }>> {\n    const results: Record<string, { valid: boolean; errors: string[] }> = {};\n\n    for (const [sourceName, sourceConfig] of Object.entries(this.config.sources)) {\n      const errors: string[] = [];\n      \n      if (!sourceConfig.name) errors.push('Name is required');\n      if (!sourceConfig.url) errors.push('URL is required');\n      if (!sourceConfig.license) errors.push('License is required');\n      if (!sourceConfig.attribution) errors.push('Attribution is required');\n      \n      if (sourceConfig.url && !sourceConfig.url.startsWith('http')) {\n        errors.push('URL must start with http or https');\n      }\n\n      results[sourceName] = {\n        valid: errors.length === 0,\n        errors\n      };\n    }\n\n    return results;\n  }\n}\n\n// Export singleton instance\nexport const etlPipeline = new ETLPipeline();\n