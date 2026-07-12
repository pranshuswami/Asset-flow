"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
function validateBody(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
            error.status = 400;
            throw error;
        }
        req.body = parsed.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const parsed = schema.safeParse(req.query);
        if (!parsed.success) {
            const error = new Error(parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
            error.status = 400;
            throw error;
        }
        next();
    };
}
//# sourceMappingURL=validation.js.map