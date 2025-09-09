// Essential Java Standard Library for Managed Devices
// This provides only the essential Java classes and methods needed for basic programming
// without requiring system Java installation

export class EssentialSystem {
  static out = new EssentialPrintStream();
}

export class EssentialPrintStream {
  private buffer: string[] = [];
  
  print(content: any): void {
    this.buffer.push(String(content));
  }
  
  println(content?: any): void {
    if (content !== undefined) {
      this.buffer.push(String(content));
    }
    this.buffer.push('\n');
  }
  
  getOutput(): string {
    return this.buffer.join('');
  }
  
  clear(): void {
    this.buffer = [];
  }
}

export class EssentialMath {
  static abs(x: number): number {
    return Math.abs(x);
  }
  
  static max(a: number, b: number): number {
    return Math.max(a, b);
  }
  
  static min(a: number, b: number): number {
    return Math.min(a, b);
  }
  
  static sqrt(x: number): number {
    return Math.sqrt(x);
  }
  
  static pow(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }
  
  static round(x: number): number {
    return Math.round(x);
  }
  
  static floor(x: number): number {
    return Math.floor(x);
  }
  
  static ceil(x: number): number {
    return Math.ceil(x);
  }
  
  static random(): number {
    return Math.random();
  }
  
  static PI: number = Math.PI;
  static E: number = Math.E;
}

export class EssentialString {
  private value: string;
  
  constructor(value: string) {
    this.value = String(value);
  }
  
  length(): number {
    return this.value.length;
  }
  
  charAt(index: number): string {
    if (index < 0 || index >= this.value.length) {
      return '';
    }
    return this.value.charAt(index);
  }
  
  substring(beginIndex: number, endIndex?: number): string {
    if (endIndex === undefined) {
      return this.value.substring(beginIndex);
    }
    return this.value.substring(beginIndex, endIndex);
  }
  
  toLowerCase(): string {
    return this.value.toLowerCase();
  }
  
  toUpperCase(): string {
    return this.value.toUpperCase();
  }
  
  contains(substring: string): boolean {
    return this.value.includes(substring);
  }
  
  startsWith(prefix: string): boolean {
    return this.value.startsWith(prefix);
  }
  
  endsWith(suffix: string): boolean {
    return this.value.endsWith(suffix);
  }
  
  trim(): string {
    return this.value.trim();
  }
  
  replace(oldChar: string, newChar: string): string {
    return this.value.replace(new RegExp(oldChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newChar);
  }
  
  split(regex: string): string[] {
    return this.value.split(regex);
  }
  
  indexOf(str: string): number {
    return this.value.indexOf(str);
  }
  
  lastIndexOf(str: string): number {
    return this.value.lastIndexOf(str);
  }
  
  equals(other: any): boolean {
    return this.value === String(other);
  }
  
  toString(): string {
    return this.value;
  }
  
  // Static methods
  static valueOf(value: any): string {
    return String(value);
  }
  
  static format(template: string, ...args: any[]): string {
    // Simple format implementation for basic use cases
    let result = template;
    for (let i = 0; i < args.length; i++) {
      result = result.replace(`%${i + 1}`, String(args[i]));
    }
    return result;
  }
}

export class EssentialArrays {
  static toString(arr: any[]): string {
    if (!Array.isArray(arr)) {
      return 'null';
    }
    return '[' + arr.join(', ') + ']';
  }
  
  static equals(a: any[], b: any[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  
  static fill(arr: any[], value: any): void {
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = value;
      }
    }
  }
  
  static copyOf(original: any[], newLength: number): any[] {
    if (!Array.isArray(original)) {
      return [];
    }
    const result = new Array(newLength);
    const copyLength = Math.min(original.length, newLength);
    for (let i = 0; i < copyLength; i++) {
      result[i] = original[i];
    }
    return result;
  }
  
  static sort(arr: number[]): void {
    if (Array.isArray(arr)) {
      arr.sort((a, b) => a - b);
    }
  }
  
  static binarySearch(arr: number[], key: number): number {
    if (!Array.isArray(arr)) {
      return -1;
    }
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === key) {
        return mid;
      } else if (arr[mid] < key) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return -1;
  }
}

export class EssentialArrayList<T> {
  private elements: T[] = [];
  
  constructor(initialCapacity?: number) {
    if (initialCapacity && initialCapacity > 0) {
      this.elements = new Array(initialCapacity);
    }
  }
  
  add(element: T): boolean {
    this.elements.push(element);
    return true;
  }
  
  addAll(collection: T[]): boolean {
    for (const element of collection) {
      this.elements.push(element);
    }
    return true;
  }
  
  get(index: number): T | null {
    if (index < 0 || index >= this.elements.length) {
      return null;
    }
    return this.elements[index];
  }
  
  set(index: number, element: T): T | null {
    if (index < 0 || index >= this.elements.length) {
      return null;
    }
    const oldElement = this.elements[index];
    this.elements[index] = element;
    return oldElement;
  }
  
  remove(index: number): T | null {
    if (index < 0 || index >= this.elements.length) {
      return null;
    }
    const removedElement = this.elements[index];
    this.elements.splice(index, 1);
    return removedElement;
  }
  
  size(): number {
    return this.elements.length;
  }
  
  isEmpty(): boolean {
    return this.elements.length === 0;
  }
  
  clear(): void {
    this.elements = [];
  }
  
  contains(element: T): boolean {
    return this.elements.includes(element);
  }
  
  indexOf(element: T): number {
    return this.elements.indexOf(element);
  }
  
  toArray(): T[] {
    return [...this.elements];
  }
  
  toString(): string {
    return EssentialArrays.toString(this.elements);
  }
}

export class EssentialScanner {
  private input: string;
  private currentIndex: number = 0;
  private delimiter: RegExp = /\s+/;
  
  constructor(input: string) {
    this.input = input;
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.input.length;
  }
  
  next(): string {
    if (!this.hasNext()) {
      return '';
    }
    
    // Skip leading delimiters
    while (this.currentIndex < this.input.length && this.delimiter.test(this.input[this.currentIndex])) {
      this.currentIndex++;
    }
    
    if (this.currentIndex >= this.input.length) {
      return '';
    }
    
    // Find next delimiter
    let endIndex = this.currentIndex;
    while (endIndex < this.input.length && !this.delimiter.test(this.input[endIndex])) {
      endIndex++;
    }
    
    const result = this.input.substring(this.currentIndex, endIndex);
    this.currentIndex = endIndex;
    
    return result;
  }
  
  nextInt(): number {
    const next = this.next();
    return parseInt(next) || 0;
  }
  
  nextDouble(): number {
    const next = this.next();
    return parseFloat(next) || 0.0;
  }
  
  nextLine(): string {
    if (this.currentIndex >= this.input.length) {
      return '';
    }
    
    const result = this.input.substring(this.currentIndex);
    this.currentIndex = this.input.length;
    return result;
  }
  
  close(): void {
    // No resources to close in this implementation
  }
}

// Essential Java wrapper classes
export class EssentialInteger {
  static parseInt(s: string): number {
    return parseInt(s) || 0;
  }
  
  static toString(i: number): string {
    return String(i);
  }
  
  static valueOf(i: number): number {
    return i;
  }
  
  static MAX_VALUE: number = Number.MAX_SAFE_INTEGER;
  static MIN_VALUE: number = Number.MIN_SAFE_INTEGER;
}

export class EssentialDouble {
  static parseDouble(s: string): number {
    return parseFloat(s) || 0.0;
  }
  
  static toString(d: number): string {
    return String(d);
  }
  
  static valueOf(d: number): number {
    return d;
  }
  
  static MAX_VALUE: number = Number.MAX_VALUE;
  static MIN_VALUE: number = Number.MIN_VALUE;
  static POSITIVE_INFINITY: number = Infinity;
  static NEGATIVE_INFINITY: number = -Infinity;
  static NaN: number = NaN;
}

export class EssentialBoolean {
  static parseBoolean(s: string): boolean {
    return s.toLowerCase() === 'true';
  }
  
  static toString(b: boolean): string {
    return String(b);
  }
  
  static valueOf(b: boolean): boolean {
    return b;
  }
  
  static TRUE: boolean = true;
  static FALSE: boolean = false;
}

// Essential Java exception classes
export class EssentialException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EssentialException';
  }
}

export class EssentialRuntimeException extends EssentialException {
  constructor(message: string) {
    super(message);
    this.name = 'EssentialRuntimeException';
  }
}

export class EssentialIllegalArgumentException extends EssentialException {
  constructor(message: string) {
    super(message);
    this.name = 'EssentialIllegalArgumentException';
  }
}

// Export all essential classes
export const EssentialJava = {
  System: EssentialSystem,
  Math: EssentialMath,
  String: EssentialString,
  Arrays: EssentialArrays,
  ArrayList: EssentialArrayList,
  Scanner: EssentialScanner,
  Integer: EssentialInteger,
  Double: EssentialDouble,
  Boolean: EssentialBoolean,
  Exception: EssentialException,
  RuntimeException: EssentialRuntimeException,
  IllegalArgumentException: EssentialIllegalArgumentException
};


