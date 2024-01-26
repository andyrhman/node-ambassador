import { Router } from "express";
import { AuthenticatedUser, Login, Logout, Register } from "./controller/auth.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";

const routes = (router: Router) => {
    router.post('/api/admin/register', Register);
    router.post('/api/admin/login', Login);
    router.get('/api/admin/user', AuthMiddleware, AuthenticatedUser);
    router.post('/api/admin/logout', AuthMiddleware, Logout);
}

export default routes;