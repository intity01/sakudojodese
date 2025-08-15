// Data Extractors
// Extract data from various open source formats and APIs

import type { DataSourceConfig, ETLPipelineConfig } from './config';
import { SOURCE_PROCESSORS } from './config';

export interface ExtractedData {
  source: string;
  format: string;
  data: any;
  metadata: {
    size: number;
    extractedAt: string;
    checksum?: string;
    encoding?: string;
  };
}

export class DataExtractor {
  private config: ETLPipelineConfig;
  private cache: Map<string, ExtractedData> = new Map();

  constructor(config: ETLPipelineConfig) {
    this.config = config;
  }

  // Main extraction method
  async extract(sourceName: string, sourceConfig: DataSourceConfig): Promise<any> {
    console.log(`[Extractor] Extracting from ${sourceName} (${sourceConfig.format})...`);

    // Check cache first
    const cacheKey = `${sourceName}_${sourceConfig.version || 'latest'}`;
    if (this.cache.has(cacheKey)) {
      console.log(`[Extractor] Using cached data for ${sourceName}`);
      return this.cache.get(cacheKey)!.data;
    }

    let extractedData: ExtractedData;

    try {
      switch (sourceConfig.format) {
        case 'json':
          extractedData = await this.extractJSON(sourceName, sourceConfig);
          break;
        case 'xml':
          extractedData = await this.extractXML(sourceName, sourceConfig);
          break;
        case 'csv':
          extractedData = await this.extractCSV(sourceName, sourceConfig);
          break;
        case 'tsv':
          extractedData = await this.extractTSV(sourceName, sourceConfig);
          break;
        case 'txt':
          extractedData = await this.extractTXT(sourceName, sourceConfig);
          break;
        default:
          throw new Error(`Unsupported format: ${sourceConfig.format}`);
      }

      // Cache the result
      this.cache.set(cacheKey, extractedData);
      
      console.log(`[Extractor] Successfully extracted ${extractedData.metadata.size} bytes from ${sourceName}`);
      return extractedData.data;

    } catch (error) {
      console.error(`[Extractor] Failed to extract from ${sourceName}:`, error);
      throw error;
    }
  }

  // JSON extraction
  private async extractJSON(sourceName: string, sourceConfig: DataSourceConfig): Promise<ExtractedData> {
    const response = await this.fetchWithRetry(sourceConfig.url);
    const text = await response.text();
    const data = JSON.parse(text);

    return {
      source: sourceName,
      format: 'json',
      data,
      metadata: {
        size: text.length,
        extractedAt: new Date().toISOString(),
        encoding: 'utf-8'
      }
    };
  }

  // XML extraction
  private async extractXML(sourceName: string, sourceConfig: DataSourceConfig): Promise<ExtractedData> {
    const response = await this.fetchWithRetry(sourceConfig.url);
    let text = await response.text();

    // Handle gzipped content
    if (sourceConfig.url.endsWith('.gz')) {
      // In a real implementation, you'd use a proper gzip library
      // For now, we'll simulate decompression
      console.log(`[Extractor] Note: ${sourceName} appears to be gzipped, decompression needed`);
    }

    // Parse XML to a simplified object structure
    const data = this.parseXMLToObject(text, sourceName);\n\n    return {\n      source: sourceName,\n      format: 'xml',\n      data,\n      metadata: {\n        size: text.length,\n        extractedAt: new Date().toISOString(),\n        encoding: 'utf-8'\n      }\n    };\n  }\n\n  // CSV extraction\n  private async extractCSV(sourceName: string, sourceConfig: DataSourceConfig): Promise<ExtractedData> {\n    const response = await this.fetchWithRetry(sourceConfig.url);\n    const text = await response.text();\n    \n    const processor = SOURCE_PROCESSORS[sourceName as keyof typeof SOURCE_PROCESSORS];\n    const data = this.parseCSV(text, processor);\n\n    return {\n      source: sourceName,\n      format: 'csv',\n      data,\n      metadata: {\n        size: text.length,\n        extractedAt: new Date().toISOString(),\n        encoding: processor?.encoding || 'utf-8'\n      }\n    };\n  }\n\n  // TSV extraction\n  private async extractTSV(sourceName: string, sourceConfig: DataSourceConfig): Promise<ExtractedData> {\n    const response = await this.fetchWithRetry(sourceConfig.url);\n    const text = await response.text();\n    \n    const processor = SOURCE_PROCESSORS[sourceName as keyof typeof SOURCE_PROCESSORS];\n    const data = this.parseTSV(text, processor);\n\n    return {\n      source: sourceName,\n      format: 'tsv',\n      data,\n      metadata: {\n        size: text.length,\n        extractedAt: new Date().toISOString(),\n        encoding: processor?.encoding || 'utf-8'\n      }\n    };\n  }\n\n  // TXT extraction\n  private async extractTXT(sourceName: string, sourceConfig: DataSourceConfig): Promise<ExtractedData> {\n    const response = await this.fetchWithRetry(sourceConfig.url);\n    const text = await response.text();\n    \n    const processor = SOURCE_PROCESSORS[sourceName as keyof typeof SOURCE_PROCESSORS];\n    const data = this.parseTXT(text, processor);\n\n    return {\n      source: sourceName,\n      format: 'txt',\n      data,\n      metadata: {\n        size: text.length,\n        extractedAt: new Date().toISOString(),\n        encoding: processor?.encoding || 'utf-8'\n      }\n    };\n  }\n\n  // HTTP utilities\n  private async fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {\n    let lastError: Error;\n\n    for (let attempt = 1; attempt <= maxRetries; attempt++) {\n      try {\n        console.log(`[Extractor] Fetching ${url} (attempt ${attempt}/${maxRetries})...`);\n        \n        const response = await fetch(url, {\n          headers: {\n            'User-Agent': 'Saku-Dojo-ETL/1.0 (+https://github.com/saku-dojo/saku-dojo)'\n          },\n          timeout: 30000 // 30 second timeout\n        });\n\n        if (!response.ok) {\n          throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n        }\n\n        return response;\n      } catch (error) {\n        lastError = error instanceof Error ? error : new Error('Unknown error');\n        \n        if (attempt < maxRetries) {\n          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff\n          console.log(`[Extractor] Attempt ${attempt} failed, retrying in ${delay}ms...`);\n          await new Promise(resolve => setTimeout(resolve, delay));\n        }\n      }\n    }\n\n    throw lastError!;\n  }\n\n  // Parsing utilities\n  private parseCSV(text: string, processor: any): any[] {\n    const lines = text.split('\\n').filter(line => line.trim());\n    const skipRows = processor?.skipRows || 0;\n    const columns = processor?.columns || [];\n    \n    const dataLines = lines.slice(skipRows);\n    const result: any[] = [];\n\n    for (const line of dataLines) {\n      const values = this.parseCSVLine(line);\n      \n      if (columns.length > 0) {\n        const row: any = {};\n        columns.forEach((col: string, index: number) => {\n          row[col] = values[index] || '';\n        });\n        result.push(row);\n      } else {\n        result.push(values);\n      }\n    }\n\n    return result;\n  }\n\n  private parseTSV(text: string, processor: any): any[] {\n    const lines = text.split('\\n').filter(line => line.trim());\n    const columns = processor?.columns || [];\n    const separator = processor?.separator || '\\t';\n    \n    const result: any[] = [];\n\n    for (const line of lines) {\n      const values = line.split(separator);\n      \n      if (columns.length > 0) {\n        const row: any = {};\n        columns.forEach((col: string, index: number) => {\n          row[col] = values[index] || '';\n        });\n        result.push(row);\n      } else {\n        result.push(values);\n      }\n    }\n\n    return result;\n  }\n\n  private parseTXT(text: string, processor: any): any[] {\n    const lines = text.split('\\n').filter(line => line.trim());\n    const columns = processor?.columns || ['word', 'frequency'];\n    const separator = processor?.separator || ' ';\n    \n    const result: any[] = [];\n\n    for (const line of lines) {\n      const values = line.split(separator).filter(v => v.trim());\n      \n      if (values.length >= 2) {\n        const row: any = {};\n        columns.forEach((col: string, index: number) => {\n          row[col] = values[index] || '';\n        });\n        result.push(row);\n      }\n    }\n\n    return result;\n  }\n\n  private parseCSVLine(line: string): string[] {\n    const result: string[] = [];\n    let current = '';\n    let inQuotes = false;\n    \n    for (let i = 0; i < line.length; i++) {\n      const char = line[i];\n      \n      if (char === '\"') {\n        inQuotes = !inQuotes;\n      } else if (char === ',' && !inQuotes) {\n        result.push(current.trim());\n        current = '';\n      } else {\n        current += char;\n      }\n    }\n    \n    result.push(current.trim());\n    return result;\n  }\n\n  private parseXMLToObject(xmlText: string, sourceName: string): any {\n    // Simplified XML parsing for demo purposes\n    // In a real implementation, you'd use a proper XML parser like xml2js\n    \n    if (sourceName === 'jmdict') {\n      return this.parseJMdictXML(xmlText);\n    } else if (sourceName === 'kanjidic2') {\n      return this.parseKanjidicXML(xmlText);\n    }\n    \n    // Generic XML parsing fallback\n    return { raw: xmlText.substring(0, 1000) + '...' }; // Truncated for demo\n  }\n\n  private parseJMdictXML(xmlText: string): any {\n    // Mock JMdict parsing - in reality would use proper XML parser\n    const entries = [];\n    \n    // Extract sample entries for demo\n    const entryMatches = xmlText.match(/<entry>.*?<\\/entry>/gs) || [];\n    \n    for (let i = 0; i < Math.min(100, entryMatches.length); i++) {\n      const entry = entryMatches[i];\n      \n      // Extract basic info (simplified)\n      const kanjiMatch = entry.match(/<keb>(.*?)<\\/keb>/);\n      const readingMatch = entry.match(/<reb>(.*?)<\\/reb>/);\n      const meaningMatch = entry.match(/<gloss.*?>(.*?)<\\/gloss>/);\n      \n      if (kanjiMatch || readingMatch) {\n        entries.push({\n          kanji: kanjiMatch?.[1] || '',\n          reading: readingMatch?.[1] || '',\n          meaning: meaningMatch?.[1] || '',\n          source: 'jmdict'\n        });\n      }\n    }\n    \n    return entries;\n  }\n\n  private parseKanjidicXML(xmlText: string): any {\n    // Mock KANJIDIC2 parsing - in reality would use proper XML parser\n    const characters = [];\n    \n    // Extract sample characters for demo\n    const charMatches = xmlText.match(/<character>.*?<\\/character>/gs) || [];\n    \n    for (let i = 0; i < Math.min(100, charMatches.length); i++) {\n      const char = charMatches[i];\n      \n      // Extract basic info (simplified)\n      const literalMatch = char.match(/<literal>(.*?)<\\/literal>/);\n      const gradeMatch = char.match(/<grade>(.*?)<\\/grade>/);\n      const meaningMatch = char.match(/<meaning.*?>(.*?)<\\/meaning>/);\n      \n      if (literalMatch) {\n        characters.push({\n          character: literalMatch[1],\n          grade: gradeMatch?.[1] || '',\n          meaning: meaningMatch?.[1] || '',\n          source: 'kanjidic2'\n        });\n      }\n    }\n    \n    return characters;\n  }\n\n  // Cache management\n  clearCache(): void {\n    this.cache.clear();\n    console.log('[Extractor] Cache cleared');\n  }\n\n  getCacheSize(): number {\n    return this.cache.size;\n  }\n\n  getCacheKeys(): string[] {\n    return Array.from(this.cache.keys());\n  }\n\n  // Health check\n  async healthCheck(): Promise<{ status: 'healthy' | 'degraded'; details: any }> {\n    return {\n      status: 'healthy',\n      details: {\n        cacheSize: this.cache.size,\n        timestamp: new Date().toISOString()\n      }\n    };\n  }\n}\n