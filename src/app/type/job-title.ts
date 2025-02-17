export interface JobTitle {
    id?: number;
    title_name: string;          
    allowed_break_time: string;   
    overtime_hour_value: number;  
    delay_minute_value: number;   
    shift_system: boolean,
    production_system: boolean,
    month_system: boolean,

  //   work_systems: {
  //     shift_system: boolean,
  //     production_system: boolean,
  //     month_system: boolean,
  //     custom_system: boolean
  // }
  }