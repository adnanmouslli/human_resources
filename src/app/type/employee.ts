import { WorkSystem } from "../core/services/employee/employee.service";

export interface Employee {
  id: number;
  fingerprint_id: string;
  full_name: string;
  salary: number;
  employee_type: 'permanent' | 'temporary';  // نوع الموظف
  position?: number;                         // المسمى الوظيفي (للموظف الدائم)
  profession_id?: number;                    // المهنة (للموظف المؤقت)
  position_name?: string;                    // اسم المسمى الوظيفي (للعرض)
  profession_name?: string;                  // اسم المهنة (للعرض)
  advancePercentage: number | null; 
  allowances: string;
  insurance_deduction: string;
  certificates: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  date_of_joining: string | null;
  id_card_number: string | null;
  national_id: string;
  residence: string;
  mobile_1: string;
  mobile_2: string | null;
  mobile_3: string | null;
  work_system: WorkSystem;
  shift_id: number | null;
  worker_agreement: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}


export interface ListEmployee {
  id: number;
  full_name: string;
}