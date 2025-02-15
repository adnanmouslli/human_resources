import { Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppConfig {
  inputStyle: string;
  colorScheme: string;
  theme: string;
  ripple: boolean;
  menuMode: string;
  scale: number;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly THEME_STORAGE_KEY = 'app-theme-config';

  private getStoredThemeConfig(): Partial<AppConfig> {
    try {
      const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        colorScheme: 'light',
        theme: 'bootstrap4-light-blue'
      };
    } catch {
      return {
        colorScheme: 'light',
        theme: 'bootstrap4-light-blue'
      };
    }
  }

  private initConfig(): AppConfig {
    const stored = this.getStoredThemeConfig();
    return {
      ripple: false,
      inputStyle: 'filled',
      menuMode: 'static',
      colorScheme: stored.colorScheme!,
      theme: stored.theme!,
      scale: 14,
    };
  }

  _config: AppConfig = this.initConfig();
  config = signal<AppConfig>(this._config);

  constructor() {
    effect(() => {
      const config = this.config();
      if (this.updateStyle(config)) {
        this.changeTheme();
        this.saveThemeConfig(config);
      }
      this.changeScale(config.scale);
      this.onConfigUpdate();
    });

    // Force initial theme change
    this.changeTheme();
  }



  state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  private configUpdate = new Subject<AppConfig>();
  private overlayOpen = new Subject<any>();

  configUpdate$ = this.configUpdate.asObservable();
  overlayOpen$ = this.overlayOpen.asObservable();

  private saveThemeConfig(config: AppConfig) {
    const themeConfig = {
      theme: config.theme,
      colorScheme: config.colorScheme
    };
    localStorage.setItem(this.THEME_STORAGE_KEY, JSON.stringify(themeConfig));
  }

  updateStyle(config: AppConfig) {
    return (
      config.theme !== this._config.theme ||
      config.colorScheme !== this._config.colorScheme
    );
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.state.overlayMenuActive = !this.state.overlayMenuActive;
      if (this.state.overlayMenuActive) {
        this.overlayOpen.next(null);
      }
    }

    if (this.isDesktop()) {
      this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
    } else {
      this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

      if (this.state.staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  showProfileSidebar() {
    this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
    if (this.state.profileSidebarVisible) {
      this.overlayOpen.next(null);
    }
  }

  showConfigSidebar() {
    this.state.configSidebarVisible = true;
  }

  isOverlay() {
    return this.config().menuMode === 'overlay';
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this._config = { ...this.config() };
    this.configUpdate.next(this.config());
  }

  changeTheme() {
    const config = this.config();
    const themeLink = document.getElementById('theme-css') as HTMLLinkElement;
    
    if (!themeLink) {
      console.error('Theme link not found');
      return;
    }
  
    const themeLinkHref = themeLink.getAttribute('href');
    if (!themeLinkHref) {
      console.error('Theme href not found');
      return;
    }
  
    // Get current theme parts
    const pathParts = themeLinkHref.split('/');
    const themeIndex = pathParts.findIndex(part => part.includes('bootstrap4'));
    const colorSchemeIndex = pathParts.findIndex(part => part.includes('theme-'));
  
    if (themeIndex !== -1) {
      pathParts[themeIndex] = config.theme;
    }
    
    if (colorSchemeIndex !== -1) {
      pathParts[colorSchemeIndex] = `theme-${config.colorScheme}`;
    }
  
    const newHref = pathParts.join('/');
   
    this.replaceThemeLink(newHref);
  }
  
  replaceThemeLink(href: string) {
    const id = 'theme-css';
    const themeLink = document.getElementById(id) as HTMLLinkElement;
    
    if (!themeLink) {
      console.error('Theme link element not found');
      return;
    }
  
    const clone = themeLink.cloneNode(true) as HTMLLinkElement;
    clone.href = href;
    clone.id = id + '-clone';
  
    clone.addEventListener('load', () => {
      themeLink.remove();
      clone.id = id;
    });
  
    themeLink.parentNode?.insertBefore(clone, themeLink.nextSibling);
  }
  changeScale(value: number) {
    document.documentElement.style.fontSize = `${value}px`;
  }
}