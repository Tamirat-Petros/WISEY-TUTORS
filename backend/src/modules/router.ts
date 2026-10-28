import { Router } from "express";
import catalogRouter from "./catalog/router.js";
import inquiriesRouter from "./inquiries/router.js";
import bookingRequestRouter from "./booking-requests/router.js";

const router = Router();
router.use("/catalog", catalogRouter);
router.use("/inquiries", inquiriesRouter);
router.use("/booking-requests", bookingRequestRouter);
export default router;
