export interface AttendanceRecord {
  actualCheckIn: string; // وقت الحضور الفعلي
  actualCheckOut: string; // وقت الانصراف الفعلي
  attendancePeriods: AttendancePeriod[]; // فترات الحضور
  checkInStatus: string; // حالة الحضور (مثال: "Late")
  checkOutStatus: string; // حالة الانصراف (مثال: "On Time")
  date: string; // التاريخ
  employee: Employee; // بيانات الموظف
  nextAction: string; // الإجراء التالي (مثال: "check-out")
  totalBreakTime: string; // إجمالي وقت الاستراحة
  totalWorkTime: string; // إجمالي وقت العمل
}

export interface AttendancePeriod {
  checkInTime: string; // وقت بداية الحضور للفترة
  checkOutTime: string | null; // وقت نهاية الحضور للفترة (قد تكون null إذا لم يُسجَّل الانصراف)
}

export interface Employee {
  id: number; // رقم تعريف الموظف
  name: string; // اسم الموظف
  work_system: string; // نظام العمل (مثال: "shift")
}


export interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    total: number;
}