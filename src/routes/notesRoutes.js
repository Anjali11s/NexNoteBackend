import express from 'express';
import { createANote, deleteNote, getAllNotes, updateNote,getNotes, togglePinNote } from '../controllers/notesControllers.js';
const router = express.Router(); // create a router instance so that we can use it to define our routes and use it all at one place in esrver.js

import { protect } from '../middleware/auth.js';
// All note routes need authentication
router.use(protect);

router.get("/",getAllNotes);

router.get("/:id",getNotes);

router.post("/",createANote);

router.put("/:id",updateNote);

router.delete("/:id",deleteNote);

router.patch("/:id/pin", togglePinNote);

export default router; // export the router instance so that we can use it in server.js