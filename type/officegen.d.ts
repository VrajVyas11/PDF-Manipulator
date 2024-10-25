declare module 'officegen' {
    interface OfficeGen {
        (type: string): any;
        on(event: string, callback: Function): void;
        createP(): any;
        generate(response: any): void;
    }

    const officegen: (type: string) => OfficeGen;
    export default officegen;
}
