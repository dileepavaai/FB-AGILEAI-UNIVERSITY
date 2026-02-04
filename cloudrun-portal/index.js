import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

/* -------------------------------------------
   Firebase Admin (Cloud Run native)
------------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp();
}

/* -------------------------------------------
   Health check (MANDATORY)
------------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "aaiu-portal-resolver",
    status: "ok"
  });
});

/* -------------------------------------------
   Server
------------------------------------------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Portal resolver running on port ${PORT}`);
});
