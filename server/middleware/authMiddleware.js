// middleware/authMiddleware.js

import { getAuth } from "@clerk/express";

export const protect = (req, res, next) => {
    try {
        const auth = getAuth(req);

        console.log("========== AUTH DEBUG ==========");
        console.log("Authorization:", req.headers.authorization);
        console.log("Auth:", auth);
        console.log("===============================");

        if (!auth || !auth.userId) {
            return res.status(401).json({
                error: "Unauthorized",
                auth
            });
        }

        req.auth = auth;
        req.userId = auth.userId;

        next();
    } catch (err) {
        console.error(err);

        return res.status(401).json({
            error: err.message
        });
    }
};