export interface Employee {
  id: number;
  code: string;
  name: string;
}

export interface Advance {
  id?: number;
  date: Date;
  employee_code: string;
  employee_name: string;
  amount: number;
  document_number: string;
  notes?: string;
}