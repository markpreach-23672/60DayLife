import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import lessonsRouter from "./lessons";
import progressRouter from "./progress";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/lessons", lessonsRouter);
router.use("/progress", progressRouter);
router.use("/admin", adminRouter);

export default router;
