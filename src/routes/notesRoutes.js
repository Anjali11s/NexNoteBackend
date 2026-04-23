import express from 'express';
import { createANote, deleteNote, getAllNotes, updateNote,getNotes, togglePinNote } from '../controllers/notesControllers.js';

import { protect } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';


const router = express.Router(); // create a router instance so that we can use it to define our routes and use it all at one place in esrver.js

// All note routes need authentication
router.use(protect);

router.get("/", getAllNotes);

// Apply validateObjectId middleware to routes with :id parameter
router.get("/:id", validateObjectId, getNotes);
router.post("/", createANote);
router.put("/:id", validateObjectId, updateNote);
router.delete("/:id", validateObjectId, deleteNote);
router.patch("/:id/pin", validateObjectId, togglePinNote);

export default router; // export the router instance so that we can use it in server.js