import { Router } from "express";
import authRouter from "./auth/router.js";
import catalogRouter from "./catalog/router.js";
import inquiriesRouter from "./inquiries/router.js";
import bookingRequestRouter from "./booking-requests/router.js";
import adminRouter from "./admin/router.js";

const router = Router();
router.use("/auth", authRouter);
router.use("/catalog", catalogRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/booking-requests", bookingRequestRouter);
router.use("/admin", adminRouter);
export default router;
