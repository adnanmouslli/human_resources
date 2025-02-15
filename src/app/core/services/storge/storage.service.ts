import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Set item in storage
   * @param key Storage key
   * @param value Value to store
   */
  setItem(key: string, value: string): void {
    try {
      // You could implement more secure storage mechanisms here
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing item', error);
    }
  }

  /**
   * Get item from storage
   * @param key Storage key
   * @returns Stored value or null
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving item', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   * @param key Storage key
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item', error);
    }
  }
}
