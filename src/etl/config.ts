// ETL Pipeline Configuration
// Configuration for integrating open source language learning data

export interface DataSourceConfig {
  name: string;
  url: string;
  format: 'json' | 'xml' | 'csv' | 'tsv' | 'txt';
  license: string;
  attribution: string;
  version?: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  enabled: boolean;
  lastUpdated?: string;
  checksum?: string;
}

export interface ETLPipelineConfig {
  sources: Record<string, DataSourceConfig>;
  processing: {
    batchSize: number;
    maxConcurrency: number;
    retryAttempts: number;
    retryDelay: number; // milliseconds
    qualityThreshold: number; // 0-1
    duplicateThreshold: number; // similarity threshold
  };
  output: {
    format: 'json' | 'sqlite' | 'postgresql';
    compression: boolean;
    validation: boolean;
    backup: boolean;
  };
  monitoring: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsEnabled: boolean;
    alertThreshold: number; // error percentage
  };
}

// Open Source Data Sources Configuration
export const ETL_CONFIG: ETLPipelineConfig = {
  sources: {
    // English Vocabulary Sources
    ngsl: {
      name: 'New General Service List (NGSL)',
      url: 'https://www.newgeneralservicelist.org/s/NGSL-101-by-band.xlsx',
      format: 'csv',
      license: 'CC-BY',
      attribution: 'New General Service List by Dr. Charles Browne, Dr. Brent Culligan and Joseph Phillips',
      version: '1.01',
      updateFrequency: 'monthly',
      enabled: true,
      lastUpdated: '2024-01-15T00:00:00Z'
    },
    
    nawl: {
      name: 'New Academic Word List (NAWL)',
      url: 'https://www.newacademicwordlist.org/s/NAWL-101-by-band.xlsx',
      format: 'csv',
      license: 'CC-BY',
      attribution: 'New Academic Word List by Dr. Charles Browne, Dr. Brent Culligan and Joseph Phillips',
      version: '1.0',
      updateFrequency: 'monthly',
      enabled: true,
      lastUpdated: '2024-01-15T00:00:00Z'
    },

    // Japanese Dictionary Sources
    jmdict: {
      name: 'JMdict',
      url: 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz',
      format: 'xml',
      license: 'EDRDG',
      attribution: 'JMdict by Electronic Dictionary Research and Development Group',
      version: '2024-08-01',
      updateFrequency: 'weekly',
      enabled: true,
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    kanjidic2: {
      name: 'KANJIDIC2',
      url: 'http://ftp.edrdg.org/pub/Nihongo/kanjidic2.xml.gz',
      format: 'xml',
      license: 'EDRDG',
      attribution: 'KANJIDIC2 by Electronic Dictionary Research and Development Group',
      version: '2024-08-01',
      updateFrequency: 'weekly',
      enabled: true,
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    // Sentence Examples
    tatoeba: {
      name: 'Tatoeba',
      url: 'https://downloads.tatoeba.org/exports/sentences.tar.bz2',
      format: 'tsv',
      license: 'CC-BY',
      attribution: 'Tatoeba Project contributors',
      version: '2024-08-01',
      updateFrequency: 'weekly',
      enabled: true,
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    tatoebaLinks: {
      name: 'Tatoeba Links',
      url: 'https://downloads.tatoeba.org/exports/links.tar.bz2',
      format: 'tsv',
      license: 'CC-BY',
      attribution: 'Tatoeba Project contributors',
      version: '2024-08-01',
      updateFrequency: 'weekly',
      enabled: true,
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    // Wiktionary Data
    wiktionaryEn: {
      name: 'Wiktionary English',
      url: 'https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.json',
      format: 'json',
      license: 'CC-BY-SA',
      attribution: 'Wiktionary contributors via Kaikki.org',
      version: '2024-08-01',
      updateFrequency: 'monthly',
      enabled: false, // Large dataset, enable when needed
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    wiktionaryJa: {
      name: 'Wiktionary Japanese',
      url: 'https://kaikki.org/dictionary/Japanese/kaikki.org-dictionary-Japanese.json',
      format: 'json',
      license: 'CC-BY-SA',
      attribution: 'Wiktionary contributors via Kaikki.org',
      version: '2024-08-01',
      updateFrequency: 'monthly',
      enabled: false, // Large dataset, enable when needed
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    // Frequency Lists
    wordFreqEn: {
      name: 'English Word Frequency',
      url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt',
      format: 'txt',
      license: 'Public-Domain',
      attribution: 'Frequency word lists by Hermit Dave',
      updateFrequency: 'manual',
      enabled: true,
      lastUpdated: '2024-01-01T00:00:00Z'
    },

    wordFreqJa: {
      name: 'Japanese Word Frequency',
      url: 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ja/ja_50k.txt',
      format: 'txt',
      license: 'Public-Domain',
      attribution: 'Frequency word lists by Hermit Dave',
      updateFrequency: 'manual',
      enabled: true,
      lastUpdated: '2024-01-01T00:00:00Z'
    },

    // Grammar Patterns (Custom curated)
    grammarPatternsEn: {
      name: 'English Grammar Patterns',
      url: 'https://raw.githubusercontent.com/saku-dojo/grammar-patterns/main/english.json',
      format: 'json',
      license: 'CC-BY',
      attribution: 'Saku Dojo Grammar Pattern Collection',
      updateFrequency: 'weekly',
      enabled: false, // Custom source, enable when available
      lastUpdated: '2024-08-01T00:00:00Z'
    },

    grammarPatternsJa: {
      name: 'Japanese Grammar Patterns',
      url: 'https://raw.githubusercontent.com/saku-dojo/grammar-patterns/main/japanese.json',
      format: 'json',
      license: 'CC-BY',
      attribution: 'Saku Dojo Grammar Pattern Collection',
      updateFrequency: 'weekly',
      enabled: false, // Custom source, enable when available
      lastUpdated: '2024-08-01T00:00:00Z'
    }
  },

  processing: {
    batchSize: 1000,
    maxConcurrency: 4,
    retryAttempts: 3,
    retryDelay: 5000,
    qualityThreshold: 0.7,
    duplicateThreshold: 0.85
  },

  output: {
    format: 'json',
    compression: true,
    validation: true,
    backup: true
  },

  monitoring: {
    logLevel: 'info',
    metricsEnabled: true,
    alertThreshold: 0.1 // 10% error rate
  }
};

// Source-specific processing configurations
export const SOURCE_PROCESSORS = {
  ngsl: {
    columns: ['rank', 'word', 'part_of_speech', 'frequency'],
    skipRows: 1,
    encoding: 'utf-8'
  },
  
  nawl: {
    columns: ['rank', 'word', 'part_of_speech', 'frequency', 'academic_field'],
    skipRows: 1,
    encoding: 'utf-8'
  },

  jmdict: {
    rootElement: 'JMdict',
    entryElement: 'entry',
    encoding: 'utf-8'
  },

  kanjidic2: {
    rootElement: 'kanjidic2',
    entryElement: 'character',
    encoding: 'utf-8'
  },

  tatoeba: {
    columns: ['id', 'language', 'text'],
    separator: '\t',
    encoding: 'utf-8'
  },

  tatoebaLinks: {
    columns: ['sentence_id', 'translation_id'],
    separator: '\t',
    encoding: 'utf-8'
  },

  wordFreqEn: {
    columns: ['word', 'frequency'],
    separator: ' ',
    encoding: 'utf-8'
  },

  wordFreqJa: {
    columns: ['word', 'frequency'],
    separator: ' ',
    encoding: 'utf-8'
  }
};

// Quality validation rules
export const QUALITY_RULES = {
  minWordLength: 1,
  maxWordLength: 50,
  minSentenceLength: 3,
  maxSentenceLength: 500,
  allowedLanguages: ['en', 'ja', 'th'],
  requiredFields: ['word', 'language'],
  bannedWords: [], // Words to exclude
  profanityCheck: true,
  duplicateCheck: true,
  licenseCheck: true
};

// Export paths
export const OUTPUT_PATHS = {
  raw: './data/raw',
  processed: './data/processed',
  final: './data/questionBanks',
  backup: './data/backup',
  logs: './logs/etl',
  temp: './temp/etl'
};

// Utility functions
export function getEnabledSources(): Record<string, DataSourceConfig> {
  return Object.fromEntries(
    Object.entries(ETL_CONFIG.sources).filter(([_, config]) => config.enabled)
  );
}

export function getSourcesByLicense(license: string): Record<string, DataSourceConfig> {
  return Object.fromEntries(
    Object.entries(ETL_CONFIG.sources).filter(([_, config]) => config.license === license)
  );
}

export function getSourcesByUpdateFrequency(frequency: DataSourceConfig['updateFrequency']): Record<string, DataSourceConfig> {
  return Object.fromEntries(
    Object.entries(ETL_CONFIG.sources).filter(([_, config]) => config.updateFrequency === frequency)
  );
}

export function isSourceOutdated(source: DataSourceConfig, days: number = 30): boolean {
  if (!source.lastUpdated) return true;
  
  const lastUpdate = new Date(source.lastUpdated);
  const now = new Date();
  const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  
  return diffDays > days;
}

export function validateSourceConfig(config: DataSourceConfig): string[] {
  const errors: string[] = [];
  
  if (!config.name) errors.push('Source name is required');
  if (!config.url) errors.push('Source URL is required');
  if (!config.license) errors.push('License is required');
  if (!config.attribution) errors.push('Attribution is required');
  
  if (config.url && !config.url.startsWith('http')) {
    errors.push('URL must start with http or https');
  }
  
  return errors;
}