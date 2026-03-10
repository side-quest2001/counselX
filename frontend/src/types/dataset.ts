export type DatasetStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  uploadedAt: string;
  rowCount: number;
  status: DatasetStatus;
  _count?: { records: number };
}

export interface UploadCSVResponse {
  success: boolean;
  message: string;
  data: {
    datasetId: string;
    datasetName: string;
    rowCount: number;
    errorCount: number;
    errors: Array<{ rowIndex: number; issues: string[] }>;
  };
}

export interface DashboardStats {
  totalDatasets: number;
  totalRecords: number;
  statusCounts: Record<string, number>;
  latestUpload: {
    name: string;
    uploadedAt: string;
    status: DatasetStatus;
  } | null;
}
