import EventSource from "./EventSource";

interface ItemSet {
   ItemIds: unknown[];
}

export default class AppStorage extends EventSource {
   private entries: Record<string, ItemSet>;

   constructor() {
      super();
      this.entries = {};
   }

   public hasItemsAt(key: string): boolean {
      return Array.isArray(this.entries?.[key]?.ItemIds) &&
         this.entries[key].ItemIds.length > 0;
   }

   public getValue(key: string, value: unknown): number {
      if (!this.hasItemsAt(key)) {
         return -1;
      }
      return this.entries[key].ItemIds.indexOf(value);
   }

   public isStored(key: string, value: unknown): boolean {
      if (!this.hasItemsAt(key)) {
         return false;
      }
      return this.getValue(key, value) !== -1;
   }

   public update(key: string, values: unknown[]): void {
      if (!Array.isArray(values)) {
         throw new TypeError('Expected values to be an array');
      }

      for (const value of values) {
         const index = this.getValue(key, value);
         if (index !== -1) {
            this.removeValue(key, index);
         } else {
            this.addValue(key, value);
         }
      }

      this.fire('storage:change', { detail: this });
   }

   public getItems(key: string): unknown[] {
      if (!this.entries[key]) {
         this.entries[key] = { ItemIds: [] };
      }

      if (!Array.isArray(this.entries[key].ItemIds)) {
         this.entries[key].ItemIds = [];
      }

      return this.entries[key].ItemIds;
   }

   private removeValue(key: string, indexToRemove: number): void {
      if (!this.hasItemsAt(key)) {
         return;
      }
      this.entries[key].ItemIds.splice(indexToRemove, 1);
   }

   private addValue(key: string, value: unknown): void {
      if (!this.entries[key]) {
         this.entries[key] = { ItemIds: [] };
      }

      if (!Array.isArray(this.entries[key].ItemIds)) {
         this.entries[key].ItemIds = [];
      }
      this.entries[key].ItemIds.push(value);
   }
}
