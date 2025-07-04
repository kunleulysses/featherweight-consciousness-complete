export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  collaborators: User[];
  leadResearcher: User;
  createdAt: Date;
  updatedAt: Date;
  datasetCount: number;
  analysisCount: number;
  tags: string[];
  visibility: ProjectVisibility;
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public'
}

export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  description: string;
  format: DataFormat;
  size: number;
  uploadedBy: User;
  uploadedAt: Date;
  status: DataStatus;
  metadata: DataMetadata;
  analysisResults?: AnalysisResult[];
}

export enum DataFormat {
  JSON = 'json',
  CSV = 'csv',
  XLSX = 'xlsx',
  XML = 'xml',
  TXT = 'txt'
}

export enum DataStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error'
}

export interface DataMetadata {
  columns?: string[];
  rowCount?: number;
  fileSize: number;
  checksumMD5: string;
  tags: string[];
}

export interface AnalysisResult {
  id: string;
  datasetId: string;
  type: AnalysisType;
  parameters: Record<string, any>;
  results: Record<string, any>;
  createdAt: Date;
  createdBy: User;
  status: AnalysisStatus;
}

export enum AnalysisType {
  STATISTICAL = 'statistical',
  ML_CLASSIFICATION = 'ml_classification',
  ML_REGRESSION = 'ml_regression',
  CLUSTERING = 'clustering',
  CUSTOM = 'custom'
}

export enum AnalysisStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

import { User } from './auth';
