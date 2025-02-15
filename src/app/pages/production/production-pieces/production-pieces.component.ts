import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductionPiecesService, ProductionPiece, PriceLevel } from '../../../core/services/ProductionPieces/production-pieces.service';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';

@Component({
 selector: 'app-production-pieces',
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
   ToastModule,
   ConfirmDialogModule,
   TooltipModule,
   TagModule,
   LoadingComponent
 ],
 providers: [ConfirmationService, MessageService],
 templateUrl: './production-pieces.component.html',
 styleUrl: './production-pieces.component.scss'
})
export class ProductionPiecesComponent implements OnInit {
 private piecesService = inject(ProductionPiecesService);
 private messageService = inject(MessageService);
 private confirmationService = inject(ConfirmationService);

 // UI states
 displayDialog = false;
 displayDetailsDialog = false;
 dialogHeader = '';
 submitted = false;

 // Data
  piece: ProductionPiece = this.initEmptyPiece();
  selectedPiece: ProductionPiece | null = null;

 // Signals
 pieces = this.piecesService.pieces;
 loading = this.piecesService.loading;

 ngOnInit() {
   this.loadPieces();
 }

 loadPieces() {
   this.piecesService.getPieces().subscribe({
     error: (error) => {
       this.messageService.add({
         severity: 'error',
         summary: 'خطأ',
         detail: error.message
       });
     }
   });
 }

 initEmptyPiece(): ProductionPiece {
   return {
     piece_number: '',
     piece_name: '',
     price_levels: {
       A: 0,
       B: 0,
       C: 0,
       D: 0,
       E: 0
     }
   };
 }

 getLevelEntries(priceLevels: PriceLevel): { grade: string; price: number }[] {
  const grades = ['A', 'B', 'C', 'D', 'E'];
  return grades.map(grade => ({
    grade,
    price: priceLevels[grade]
  }));
}

 trackByGrade(index: number, item: { grade: string; price: number }): string {
   return item.grade;
 }

 showAddDialog() {
   this.piece = this.initEmptyPiece();
   this.dialogHeader = 'إضافة قطعة جديدة';
   this.submitted = false;
   this.displayDialog = true;
 }

 showDetails(piece: ProductionPiece) {
   this.selectedPiece = { ...piece };
   this.displayDetailsDialog = true;
 }

 editPiece(piece: ProductionPiece) {
   this.piece = { ...piece };
   this.dialogHeader = 'تعديل القطعة';
   this.displayDialog = true;
 }

 hideDialog() {
   this.displayDialog = false;
   this.submitted = false;
   this.piece = this.initEmptyPiece();
 }

 confirmDelete(piece: ProductionPiece) {
   this.confirmationService.confirm({
     message: 'هل أنت متأكد من حذف هذه القطعة؟',
     header: 'تأكيد الحذف',
     icon: 'pi pi-exclamation-triangle',
     acceptLabel: 'نعم',
     rejectLabel: 'لا',
     accept: () => {
       if (piece.id) {
         this.piecesService.deletePiece(piece.id).subscribe({
           next: () => {
             this.messageService.add({
               severity: 'success',
               summary: 'تم الحذف',
               detail: 'تم حذف القطعة بنجاح'
             });
           },
           error: (error) => {
             this.messageService.add({
               severity: 'error',
               summary: 'خطأ',
               detail: error.message
             });
           }
         });
       }
     }
   });
 }

 validatePrices(): boolean {
   return !Object.values(this.piece.price_levels).some(price => price === 0);
 }

 savePiece() {
   this.submitted = true;

   if (!this.piece.piece_name || !this.piece.piece_number) {
     this.messageService.add({
       severity: 'error',
       summary: 'خطأ',
       detail: 'يرجى إكمال جميع الحقول المطلوبة'
     });
     return;
   }

   if (!this.validatePrices()) {
     this.messageService.add({
       severity: 'error',
       summary: 'خطأ',
       detail: 'يرجى إدخال جميع أسعار المستويات'
     });
     return;
   }

   const saveOperation = this.piece.id 
     ? this.piecesService.updatePiece(this.piece.id, this.piece)
     : this.piecesService.addPiece(this.piece);

   saveOperation.subscribe({
     next: () => {
       this.messageService.add({
         severity: 'success',
         summary: this.piece.id ? 'تم التحديث' : 'تم الإضافة',
         detail: this.piece.id ? 'تم تحديث القطعة بنجاح' : 'تم إضافة القطعة بنجاح'
       });
       this.hideDialog();
       this.loadPieces();

     },
     error: (error) => {
       this.messageService.add({
         severity: 'error',
         summary: 'خطأ',
         detail: error.message
       });
     }
   });
 }

 getLevelLabel(grade: string): string {
   return this.piecesService.getLevelLabel(grade);
 }

 getQualitySeverity(grade: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
   return this.piecesService.getLevelSeverity(grade);
 }
}