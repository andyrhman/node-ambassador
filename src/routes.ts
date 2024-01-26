import { Router } from "express";
import { Login, Register } from "./controller/auth.controller";

const routes = (router: Router) => {
    router.post('/api/admin/register', Register);
    router.post('/api/admin/login', Login);
}

export default routes;