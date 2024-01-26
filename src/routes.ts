import { Router } from "express";
import { Register } from "./controller/auth.controller";

const routes = (router: Router) => {
    router.post('/api/admin/register', Register);
}

export default routes;