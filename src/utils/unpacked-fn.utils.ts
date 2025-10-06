export type UnpackedFn<T> = T extends (...args: any[]) => infer U ? U : T;
