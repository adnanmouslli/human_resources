// dev-monitor.component.ts
// dev-monitor.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfigService } from '../../../core/services/config.service';
import { Environment } from '../../../core/models/environment.model';

@Component({
  selector: 'app-dev-monitor',
  standalone: true,
  imports: [CommonModule, CardModule, TabViewModule, TableModule, TagModule],
  template: `
    <div class="grid" *ngIf="environmentInfo">
      <!-- Header Card -->
      <div class="col-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="text-2xl font-bold mb-2">وضع التطوير</h2>
              <p class="text-500">{{ environmentInfo.appName }} - الإصدار {{ environmentInfo.version }}</p>
            </div>
            <p-tag [severity]="environmentInfo.production ? 'success' : 'warning'"
                   [value]="environmentInfo.production ? 'إنتاج' : 'تطوير'">
            </p-tag>
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div class="col-12 md:col-6 lg:col-4">
        <p-card header="معلومات النظام">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">اسم التطبيق:</span>
              <span class="info-value">{{ environmentInfo.appName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">الإصدار:</span>
              <span class="info-value">{{ environmentInfo.version }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">بيئة التشغيل:</span>
              <span class="info-value">{{ environmentInfo.production ? 'إنتاج' : 'تطوير' }}</span>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Features -->
      <div class="col-12 md:col-6 lg:col-4">
        <p-card header="الميزات">
          <div class="features-grid">
            <div *ngFor="let feature of features" class="feature-item">
              <span class="feature-name">{{ feature.name }}:</span>
              <p-tag [severity]="feature.enabled ? 'success' : 'danger'"
                     [value]="feature.enabled ? 'مفعل' : 'معطل'">
              </p-tag>
            </div>
          </div>
        </p-card>
      </div>

      <!-- API Info -->
      <div class="col-12 md:col-6 lg:col-4">
        <p-card header="معلومات API">
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">عنوان API:</span>
              <span class="info-value dir-ltr">{{ environmentInfo.apiBaseUrl }}</span>
            </div>
            <div class="mt-3">
              <h4 class="mb-2">نقاط النهاية:</h4>
              <div class="endpoints-list">
                <div *ngFor="let endpoint of endpoints" class="endpoint-item">
                  <span class="endpoint-key">{{ endpoint.name }}:</span>
                  <span class="endpoint-value dir-ltr">{{ endpoint.url }}</span>
                </div>
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Authentication -->
      <div class="col-12 md:col-6">
        <p-card header="إعدادات المصادقة">
          <div class="auth-info">
            <div *ngFor="let auth of authConfig" class="auth-item">
              <span class="auth-key">{{ auth.key }}:</span>
              <span class="auth-value">{{ auth.value }}</span>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Performance -->
      <div class="col-12 md:col-6">
        <p-card header="تتبع الأداء">
          <div class="performance-info">
            <div class="info-row">
              <span class="info-label">الحالة:</span>
              <p-tag [severity]="performanceEnabled ? 'success' : 'danger'"
                     [value]="performanceEnabled ? 'مفعل' : 'معطل'">
              </p-tag>
            </div>
            <div class="info-row">
              <span class="info-label">معدل العينات:</span>
              <span class="info-value">{{ environmentInfo.performanceTracking.sampleRate }}%</span>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .info-grid {
      display: grid;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      color: var(--text-500);
      font-weight: 500;
    }

    .info-value {
      font-weight: 600;
    }

    .dir-ltr {
      direction: ltr;
      text-align: left;
    }

    .endpoints-list {
      display: grid;
      gap: 0.5rem;
    }

    .endpoint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background-color: var(--surface-200);
      border-radius: 4px;
    }

    .features-grid {
      display: grid;
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .auth-info {
      display: grid;
      gap: 1rem;
    }

    .auth-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background-color: var(--surface-100);
      border-radius: 4px;
    }

    .performance-info {
      display: grid;
      gap: 1rem;
    }
  `]
})
export class DevMonitorComponent implements OnInit {
  environmentInfo?: Environment;
  features: Array<{ name: string; enabled: boolean }> = [];
  endpoints: Array<{ name: string; url: string }> = [];
  authConfig: Array<{ key: string; value: string }> = [];
  performanceEnabled = false;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // Get environment info
    this.environmentInfo = this.configService.getEnvironment();

    // Initialize features
    this.initializeFeatures();

    // Initialize endpoints
    this.initializeEndpoints();

    // Initialize auth config
    this.initializeAuthConfig();

    // Get performance tracking status
    this.performanceEnabled = this.configService.isPerformanceTrackingEnabled();

    console.log("environmentInfo: " , this.environmentInfo);
    console.log("performanceEnabled: ", this.performanceEnabled);
  }

  private initializeFeatures() {
    if (this.environmentInfo) {
      this.features = Object.entries(this.environmentInfo.features).map(([key, value]) => ({
        name: key,
        enabled: value
      }));
    }
    console.log("features:" , this.features);
  }

  private initializeEndpoints() {
    if (this.environmentInfo) {
      this.endpoints = Object.entries(this.environmentInfo.apiEndpoints).map(([key]) => ({
        name: key,
        url: this.configService.getApiEndpoint(key as keyof Environment['apiEndpoints'])
      }));
      console.log("endpoints: " , this.endpoints);
    }
  }

  private initializeAuthConfig() {
    const authConfig = this.configService.getAuthConfig();
    if (authConfig) {
      this.authConfig = Object.entries(authConfig).map(([key, value]) => ({
        key,
        value
      }));
    }
  }
}
