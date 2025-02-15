export interface Shift {
    id: number;
    name: string;
    start_time: string;      // تم تغييره من startTime
    end_time: string;        // تم تغييره من endTime
    allowed_delay_minutes: number;  // تم تغييره من allowedDelayMinutes
    allowed_exit_minutes: number;   // تم تغييره من allowedExitMinutes
    absence_minutes: number;        // تم تغييره من absenceMinutes
    extra_minutes: number;          // تم تغييره من extraMinutes
    note?: string;
  }
  
  // نوع للبيانات الجديدة
  export type CreateShiftDto = Omit<Shift, 'id'>;