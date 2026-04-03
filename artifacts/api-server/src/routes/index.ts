import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import donationsRouter from "./donations";
import votesRouter from "./votes";
import usersRouter from "./users";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(donationsRouter);
router.use(votesRouter);
router.use(usersRouter);
router.use(statsRouter);

export default router;
