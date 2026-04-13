import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import donationsRouter from "./donations";
import votesRouter from "./votes";
import usersRouter from "./users";
import statsRouter from "./stats";
import authRouter from "./auth";
import caseSubmissionsRouter from "./caseSubmissions";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(casesRouter);
router.use(donationsRouter);
router.use(votesRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(caseSubmissionsRouter);

export default router;
