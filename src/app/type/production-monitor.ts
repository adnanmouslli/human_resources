export interface FilterParams {
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  piece_id?: number; 
}

export interface RecordModel {
  employee_id: number;
  piece_id: number;
  quantity: number;
  quality_grade: string;
  date: Date;
  notes: string;
}

export interface GroupedRecord {
  employee: {
    id: number;
    full_name: string;
  };
  pieces: GroupedPiece[];
  totalQuantity: number;
}

export interface GroupedPiece {
  piece: {
    id: number;
    piece_name: string;
  };
  totalQuantity: number;
  qualityBreakdown: QualityBreakdown[];
  date: string;
  notes: string;
  records: any[]; 
}

export interface QualityBreakdown {
  grade: string;
  quantity: number;
}

export interface PieceEditModel {
  employeeId: number;
  pieceId: number;
  qualityBreakdown: QualityBreakdown[];
  date: string;
  notes: string;  

}

export interface QualityEditModel {
  grade: string;
  quantity: number;
  recordId?: number;  
  notes?: string;  // إضافة حقل الملاحظات

}

// service
export interface Employee {
  id: number;
  name: string;
}

export interface ProductionPiece {
  id: number;
  name: string;
}

export interface MonitoringFilter {
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  piece_id?: number; 
}

export interface ProductionMonitoring {
  id?: number;
  employee: Employee;
  piece: ProductionPiece;
  quantity: number;
  quality_grade: 'A' | 'B' | 'C' | 'D' | 'E';
  date: string;
  notes?: string;
  created_at?: string;
}

export interface QualityMetrics {
  quantity: number;
  records_count: number;
  average_quantity: number;
  percentage_of_total: number;
}

export interface GeneralStatistics {
  total_quantity: number;
  total_employees: number;
  total_records: number;
  average_quantity_per_record: number;
  average_quantity_per_employee: number;
}

export interface ProductivityMetrics {
  efficiency_score: number;
  quality_rate: number;
  records_per_employee: number;
}

export interface TopPerformer {
  employee_id: number;
  name: string;
  total_quantity: number;
  average_quantity: number;
  records_count: number;
}

export interface TopPiece {
  piece_id: number;
  name: string;
  total_quantity: number;
  average_quantity: number;
  records_count: number;
}

export interface HourlyProduction {
  hour: number;
  quantity: number;
  records_count: number;
}

export interface DailyStatistics {
  date: string;
  general_statistics: GeneralStatistics;
  quality_distribution: {
    [key: string]: QualityMetrics;
  };
  productivity_metrics: ProductivityMetrics;
  top_performers: TopPerformer[];
  top_pieces: TopPiece[];
  hourly_production: HourlyProduction[];
}

export interface EmployeeStatistics {
  employee: Employee;
  period: {
    start_date: string;
    end_date: string;
  };
  statistics: {
    total_quantity: number;
    average_quantity: number;
    quality_distribution: {
      [key: string]: number;
    };
  };
}

// إضافة واجهة لتمثيل بيانات المستوى الواحد
export interface QualityData {
  grade: string;
  quantity: number;
  notes?: string;
}

// إضافة واجهة لتمثيل بيانات السجلات متعددة المستويات
export interface MultiQualityRecord {
  employee_id: number;
  piece_id: number;
  date: string;
  quality_data: QualityData[];
}

// إضافة واجهة لتمثيل استجابة إضافة السجلات متعددة المستويات
export interface MultiQualityResponse {
  message: string;
  data: {
    employee_id: number;
    employee_name: string;
    piece_id: number;
    piece_name: string;
    date: string;
    records: {
      id: number;
      quality_grade: string;
      quantity: number;
      notes?: string;
    }[];
    total_quantity: number;
  };
}