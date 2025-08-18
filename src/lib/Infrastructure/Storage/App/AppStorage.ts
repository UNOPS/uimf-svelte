import EventSource from "../../EventSource";
import type { IFrontendVariable } from "./IFrontendVariable";
import type { IFrontendVariableValue } from "./IFrontendVariableValue";

interface Value {
   Variable: IFrontendVariable;
   Value: any;
}

interface IArrayValue {
   Items: any[];
}

export default class AppStorage extends EventSource {
   #entries: Record<string, Value>;

   constructor() {
      super();
      this.#entries = {};
   }

   public get(key: string): any {
      return this.#entries[key]?.Value;
   }

   public set(variable: IFrontendVariable, value: any): void {
      this.#entries[variable.Name] = { Variable: variable, Value: value };

      this.fire('change', null);
   }

   public isToggled(variable: IFrontendVariableValue): boolean {
      if (variable.Variable.IsArray) {
         const items: IArrayValue = this.get(variable.Variable.Name);
         return items?.Items?.indexOf(variable.Value) >= 0;
      } else {
         return this.get(variable.Variable.Name) === variable.Value;
      }
   }

   /**
    * Toggles the app storage variable.
    */
   toggleVariable(variable: IFrontendVariableValue) {
      if (variable.Variable.IsArray) {
         if (this.#entries[variable.Variable.Name] != null) {
            if (this.#entries[variable.Variable.Name].Variable.IsArray !== variable.Variable.IsArray) {
               throw new Error('Type of variable is not the same as the arg.');
            }
         }

         let original: IArrayValue | null = this.#entries[variable.Variable.Name]?.Value;

         let items: Set<string> = new Set(original?.Items ?? []);

         if (items.has(variable.Value!)) {
            items.delete(variable.Value!);
         } else {
            items.add(variable.Value!);
         }

         const value: IArrayValue = { Items: [...items] };
         this.set(variable.Variable, value);

         return items;
      } else {
         throw new Error('Toggle variable is not supported for non-array variables.');
      }
   }
}
