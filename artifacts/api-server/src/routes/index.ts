import { Router, type IRouter } from "express";
import healthRouter from "./health";
import briefingRouter from "./briefing";
import tasksRouter from "./tasks";
import mailRouter from "./mail";
import newsRouter from "./news";
import remindersRouter from "./reminders";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(briefingRouter);
router.use(tasksRouter);
router.use(mailRouter);
router.use(newsRouter);
router.use(remindersRouter);
router.use(chatRouter);

export default router;
