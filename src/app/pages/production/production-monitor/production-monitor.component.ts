import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { ProductionMonitoringService } from '../../../core/services/ProductionMonitoring/production-monitoring.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { ProductionPiece, ProductionPiecesService } from '../../../core/services/ProductionPieces/production-pieces.service';
import { Employee } from '../../../type/employee';
import { sumBy, chain } from 'lodash';
import { TooltipModule } from 'primeng/tooltip';

import { forkJoin, Observable } from 'rxjs';
import { DailyStatistics, EmployeeStatistics, FilterParams, GroupedPiece, GroupedRecord, PieceEditModel, ProductionMonitoring, QualityEditModel, RecordModel } from '../../../type/production-monitor';
import { ToastService } from '../../../core/services/toast.service';




@Component({
  selector: 'app-production-monitor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ToastModule,
    TagModule,
    CalendarModule,
    InputTextareaModule,
    ConfirmDialogModule,
    LoadingComponent,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './production-monitor.component.html'
})
export class ProductionMonitorComponent implements OnInit {
  private monitoringService = inject(ProductionMonitoringService);
  private employeeService = inject(EmployeeService);
  private pieceService = inject(ProductionPiecesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  // Signals and Observables
  loading = this.monitoringService.loading;
  records = this.monitoringService.monitoringRecords;
  error = this.monitoringService.error;
  dailyStats$ = this.monitoringService.getDailyStatistics();
  stats: DailyStatistics | null = null;
  employeeStats: EmployeeStatistics | null = null;

  // UI Controls
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedRecord: ProductionMonitoring | null = null;

  showStatsDialog = false;
  showDetailsDialog = false;
  selectedEmployeeStats: any | null = null;


  displayPieceEditDialog = false;
  editingPieceModel: PieceEditModel | null = null;
  qualityEditList: QualityEditModel[] = [];
  selectedEmployee: any | null = null;
  selectedPiece: any = null;

  // Lists
  employees: Employee[] = [];
  pieces: ProductionPiece[] = [];
  qualityGrades = [
    { label: 'ممتاز', value: 'A' },
    { label: 'جيد جداً', value: 'B' },
    { label: 'جيد', value: 'C' },
    { label: 'مقبول', value: 'D' },
    { label: 'ضعيف', value: 'E' }
  ];

  

  // Models
  recordModel: RecordModel = {
    employee_id: 0,
    piece_id: 0,
    quantity: 0,
    quality_grade: '',
    date: new Date(),
    notes: ''
  };

  filterModel = {
    start_date: null as Date | null,
    end_date: null as Date | null,
    employee_id: null as number | null
  };

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.loadStats();
    this.loadEmployees();
    this.loadPieces();
    this.loadRecords();

  }

  private loadStats() {
    this.monitoringService.getDailyStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Daily Stats:', stats); 
      },
      error: (err) => this.showError('خطأ في تحميل الإحصائيات', err.message)
    });
  }

  refreshStats() {
    this.loadStats();
  }

  private loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => this.employees = employees,
      error: (err) => this.showError('خطأ في تحميل قائمة الموظفين', err.message)
    });

  }

  private loadPieces() {
    this.pieceService.getPieces().subscribe({
      next: (pieces) => this.pieces = pieces,
      error: (err) => this.showError('خطأ في تحميل قائمة القطع', err.message)
    });
  }

  groupedRecords: GroupedRecord[] = [];

  
  loadRecords() {
    const params: FilterParams = {
      start_date: this.filterModel.start_date?.toISOString().split('T')[0],
      end_date: this.filterModel.end_date?.toISOString().split('T')[0],
      employee_id: this.filterModel.employee_id!
    };

    this.monitoringService.getMonitoringRecords(params).subscribe({
      next: (records) => {
        this.groupedRecords = chain(records)
          .groupBy('employee.id')
          .map((employeeRecords) => {
            const employeeData = employeeRecords[0].employee;
            
            const pieces = chain(employeeRecords)
              .groupBy('piece.id')
              .map((pieceRecords) => {
                const pieceData = pieceRecords[0].piece;
                const latestRecord = pieceRecords[pieceRecords.length - 1]; // آخر سجل للتاريخ والملاحظات
                
                const qualityBreakdown = chain(pieceRecords)
                  .groupBy('quality_grade')
                  .map((gradeRecords, grade) => ({
                    grade,
                    quantity: sumBy(gradeRecords, 'quantity')
                  }))
                  .value();

                return {
                  piece: {
                    id: pieceData.id,
                    piece_name: pieceData.name
                  },
                  totalQuantity: sumBy(pieceRecords, 'quantity'),
                  qualityBreakdown,
                  date: latestRecord.date,
                  notes: pieceRecords.map(r => r.notes).filter(Boolean).join(' | '),
                  records: pieceRecords // حفظ السجلات الأصلية
                };
              })
              .value();

            return {
              employee: {
                id: employeeData.id,
                full_name: employeeData.name
              },
              pieces,
              totalQuantity: sumBy(pieces, 'totalQuantity')
            } as GroupedRecord;
          })
          .value();
      },
      error: (err) => this.showError('خطأ في تحميل السجلات', err.message)
    });
}

  expandedRows: { [key: string]: boolean } = {};

  toggleRow(record: GroupedRecord) {
    const rowKey = record.employee.id.toString();
    this.expandedRows[rowKey] = !this.expandedRows[rowKey];
  }


  showEmployeeStats(employee: any, date: any = null) {
    const params = date ? {
      start_date: date,
      end_date: date
    } : {
      start_date: this.filterModel.start_date?.toISOString().split('T')[0],
      end_date: this.filterModel.end_date?.toISOString().split('T')[0]
    };
    
    this.monitoringService.getEmployeeStatistics(employee.id, params).subscribe({
      next: (stats) => {
        this.selectedEmployeeStats = stats;
        this.showStatsDialog = true;
      },
      error: (err) => this.showError('خطأ في تحميل إحصائيات الموظف', err.message)
    });
  }

// تحديث دالة loadEmployeeStats
loadEmployeeStats(employeeId: number) {
  const params = {
    start_date: this.filterModel.start_date?.toISOString().split('T')[0],
    end_date: this.filterModel.end_date?.toISOString().split('T')[0]
  };
  
  this.monitoringService.getEmployeeStatistics(employeeId, params).subscribe({
    next: (stats) => {
      this.selectedEmployeeStats = stats;
      this.employeeStats = stats;
    },
    error: (err) => this.showError('خطأ في تحميل إحصائيات الموظف', err.message)
  });
}

  openNew() {
    this.dialogMode = 'add';
    this.recordModel = {
      employee_id: 0,
      piece_id: 0,
      quantity: 0,
      quality_grade: '',
      date: new Date(),
      notes: ''
    };
    this.displayDialog = true;
  }

  openEdit(record: ProductionMonitoring) {
    this.dialogMode = 'edit';
    this.selectedRecord = record;
    this.recordModel = {
      employee_id: record.employee?.id || 0,  // استخدام Optional Chaining
      piece_id: record.piece?.id || 0,
      quantity: record.quantity || 0,
      quality_grade: record.quality_grade || '',
      date: record.date ? new Date(record.date) : new Date(),
      notes: record.notes || ''
    };
    this.displayDialog = true;
  }

  deleteRecord(record: ProductionMonitoring) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا السجل؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.monitoringService.deleteMonitoringRecord(record.id!).subscribe({
          next: () => {
            this.showSuccess('تم حذف السجل بنجاح');
            this.loadRecords();
            this.loadStats();
          },
          error: (err) => this.showError('خطأ في حذف السجل', err.message)
        });
      }
    });
  }

  saveRecord() {
    if (this.validateForm()) {
      const recordData = {
        ...this.recordModel,
        date: this.recordModel.date.toISOString().split('T')[0]
      };

      const operation = this.dialogMode === 'add'
        ? this.monitoringService.addMonitoringRecord(recordData)
        : this.monitoringService.updateMonitoringRecord(this.selectedRecord!.id!, recordData);

      operation.subscribe({
        next: () => {
          const message = this.dialogMode === 'add' ? 'تم إضافة السجل بنجاح' : 'تم تحديث السجل بنجاح';
          this.showSuccess(message);
          this.displayDialog = false;
          this.loadRecords();
          this.loadStats();
        },
        error: (err) => this.showError(`خطأ في ${this.dialogMode === 'add' ? 'إضافة' : 'تحديث'} السجل`, err.message)
      });
    }
  }


  applyFilter() {
    this.loadRecords();
    if (this.selectedEmployee) {
      this.loadEmployeeStats(this.selectedEmployee);
    }
  }

  resetFilter() {
    this.filterModel = {
      start_date: null,
      end_date: null,
      employee_id: null
    };
    this.selectedEmployee = null;
    this.employeeStats = null;
    this.loadRecords();
  }

  exportData() {
    // import('xlsx').then((xlsx) => {
    //   const worksheet = xlsx.utils.json_to_sheet(this.records());
    //   const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    //   xlsx.writeFile(workbook, 'production-monitoring.xlsx');
    // });
    console.log("export data")
  }

  validateForm(): boolean {
    if (this.recordModel.employee_id <= 0 || 
        this.recordModel.piece_id <= 0 || 
        !this.recordModel.quality_grade || 
        this.recordModel.quantity <= 0) {
      this.showError('خطأ في النموذج', 'جميع الحقول مطلوبة والكمية يجب أن تكون أكبر من صفر');
      return false;
    }
    return true;
  }

  getQualityTag(grade: any) {
    return {
      severity: this.monitoringService.getQualitySeverity(grade),
      value: this.monitoringService.getQualityLabel(grade)
    };
  }

  getEmployeeName(id: number): string {
    return this.employees.find(emp => emp.id === id)?.full_name || '';
  }

  getPieceName(id: number): string {
    return this.pieces.find(piece => piece.id === id)?.piece_name || '';
  }

  private showSuccess(message: string) {
    this.toastService.success(message , "نجح");
  }

  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }

  getQualityBackgroundColor(grade: any): string {
    const colorMap: { [key: string]: string } = {
      'A': 'rgba(129, 199, 132, 0.2)', // green
      'B': 'rgba(129, 212, 250, 0.2)', // blue
      'C': 'rgba(255, 213, 79, 0.2)',  // yellow
      'D': 'rgba(229, 115, 115, 0.2)', // red
      'E': 'rgba(158, 158, 158, 0.2)'  // grey
    };
    return colorMap[grade] || 'rgba(158, 158, 158, 0.2)';
  }


  editPieceRecord(employee: any, piece: GroupedPiece) {
    this.monitoringService.getMonitoringRecords({
      employee_id: employee.id,
      piece_id: piece.piece.id,
      start_date: this.filterModel.start_date?.toLocaleDateString('en-CA'),
      end_date: this.filterModel.end_date?.toLocaleDateString('en-CA')
    }).subscribe({
      next: (records) => {
        this.selectedEmployee = employee;
        this.selectedPiece = piece.piece;
        
        // تحضير نموذج التحرير مع الملاحظات
        this.qualityEditList = piece.qualityBreakdown.map(qb => {
          const record = records.find(r => r.quality_grade === qb.grade);
          return {
            grade: qb.grade,
            quantity: qb.quantity,
            recordId: record?.id,
            notes: record?.notes || ''
          };
        });

        this.editingPieceModel = {
          employeeId: employee.id,
          pieceId: piece.piece.id,
          qualityBreakdown: piece.qualityBreakdown,
          date: this.filterModel.start_date?.toLocaleDateString('en-CA') || 
                new Date().toLocaleDateString('en-CA'),
          notes: piece.notes || ''
        };

        this.displayPieceEditDialog = true;
      },
      error: (err) => this.showError('خطأ في تحميل بيانات القطعة', err.message)
    });
}

savePieceEdit() {
  if (!this.validatePieceEdit()) {
      return;
  }

  const updateOperations: Observable<any>[] = [];
  const newPieceId = this.editingPieceModel!.pieceId;
  const currentDate = this.editingPieceModel!.date;

  this.qualityEditList.forEach(quality => {
      if (!quality.grade || quality.quantity <= 0) return;

      const recordData = {
          employee_id: this.editingPieceModel!.employeeId,
          piece_id: newPieceId,
          quantity: quality.quantity,
          quality_grade: quality.grade,
          date: currentDate,
          notes: quality.notes || ''  
        };

      if (quality.recordId) {
          // تحديث السجل الموجود
          updateOperations.push(
              this.monitoringService.updateMonitoringRecord(quality.recordId, recordData)
          );
      } else {
          // إنشاء سجل جديد
          updateOperations.push(
              this.monitoringService.addMonitoringRecord(recordData)
          );
      }
  });

  // حذف السجلات القديمة التي لم تعد موجودة
  const oldRecordIds = this.qualityEditList
      .filter(q => q.recordId)
      .map(q => q.recordId!);

  this.monitoringService.getMonitoringRecords({
      employee_id: this.editingPieceModel!.employeeId,
      piece_id: this.selectedPiece?.id,
      start_date: currentDate,
      end_date: currentDate
  }).subscribe({
      next: (records) => {
          records.forEach(record => {
              if (!oldRecordIds.includes(record.id!)) {
                  updateOperations.push(
                      this.monitoringService.deleteMonitoringRecord(record.id!)
                  );
              }
          });

          // تنفيذ كل العمليات
          forkJoin(updateOperations).subscribe({
              next: () => {
                  this.showSuccess('تم تحديث سجلات القطعة بنجاح');
                  this.displayPieceEditDialog = false;
                  this.editingPieceModel = null;
                  this.qualityEditList = [];
                  this.loadRecords();
                  this.loadStats();
              },
              error: (err) => this.showError('خطأ في تحديث السجلات', err.message)
          });
      },
      error: (err) => this.showError('خطأ في تحميل السجلات', err.message)
  });
}

private validatePieceEdit(): boolean {
  if (!this.editingPieceModel?.pieceId) {
    this.showError('خطأ', 'الرجاء اختيار القطعة');
    return false;
  }

  if (!this.qualityEditList.length) {
    this.showError('خطأ', 'الرجاء إضافة مستوى جودة واحد على الأقل');
    return false;
  }

  const hasInvalidQuality = this.qualityEditList.some(
    q => !q.grade || q.quantity <= 0
  );

  if (hasInvalidQuality) {
    this.showError('خطأ', 'الرجاء إدخال مستوى الجودة والكمية لجميع السجلات');
    return false;
  }

  return true;
}

  deletePieceRecord(employee: any, piece: GroupedPiece) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف سجلات قطعة "${piece.piece.piece_name}" للموظف "${employee.full_name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const params: FilterParams = {
          employee_id: employee.id,
          piece_id: piece.piece.id,
          start_date: this.filterModel.start_date?.toLocaleDateString('en-CA'),
          end_date: this.filterModel.end_date?.toLocaleDateString('en-CA')
        };

        this.monitoringService.getMonitoringRecords(params).subscribe({
          next: (records) => {
            if (records.length === 0) {
              this.showError('خطأ', 'لم يتم العثور على سجلات للحذف');
              return;
            }

            const deleteOperations = records.map(record => 
              this.monitoringService.deleteMonitoringRecord(record.id!)
            );

            forkJoin(deleteOperations).subscribe({
              next: () => {
                this.showSuccess('تم حذف سجلات القطعة بنجاح');
                this.loadRecords();
                this.loadStats();
              },
              error: (err) => this.showError('خطأ في حذف السجلات', err.message)
            });
          },
          error: (err) => this.showError('خطأ في تحميل السجلات', err.message)
        });
      }
    });
  }


  getSelectedPiece() {
    return this.pieces.find(p => p.id === this.editingPieceModel?.pieceId);
  }

  addQualityLevel() {
    this.qualityEditList.push({
      grade: '',
      quantity: 0
    });
  }

  removeQualityLevel(index: number) {
    if (this.qualityEditList.length > 1) {
      this.qualityEditList.splice(index, 1);
    }
  }

  onQualityGradeChange(index: number) {
    // التحقق من عدم تكرار مستوى الجودة
    const currentGrade = this.qualityEditList[index].grade;
    const duplicateIndex = this.qualityEditList.findIndex(
      (q, i) => i !== index && q.grade === currentGrade
    );

    if (duplicateIndex !== -1) {
      this.showError('خطأ', 'مستوى الجودة موجود مسبقاً');
      this.qualityEditList[index].grade = '';
    }
  }

  calculateTotalQuantity(): number {
    return this.qualityEditList.reduce((sum, quality) => sum + (quality.quantity || 0), 0);
  }

  cancelPieceEdit() {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من إلغاء التعديلات؟',
      header: 'تأكيد الإلغاء',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.displayPieceEditDialog = false;
        this.editingPieceModel = null;
        this.qualityEditList = [];
      }
    });
  }

}