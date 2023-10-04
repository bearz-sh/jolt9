
export type IPkgOperationType = 'install' | 'uninstall' | 'upgrade';
export interface IPkgOperation extends Record<string, unknown> {
    operation: IPkgOperationType;
    name: string
    version?: string;
    code: number;
    success: boolean;
    message?: string;
}