import { Server } from "socket.io";
export declare function initialize(server: any): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function getIO(): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function close(): void;
export declare const socketService: {
    initialize: typeof initialize;
    getIO: typeof getIO;
    close: typeof close;
};
//# sourceMappingURL=socket.service.d.ts.map