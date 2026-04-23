import Note from "../models/Note.js"

// export async function getAllNotes(req,res){ // now we can directly write '/' instread of '.api/notes' because we have already defined the base route in server.js
//     // res.status(200).send("You just fetched the notes");
//     try {
//         const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 }); // -1 will sort in desc order (latest first)
//         res.status(200).json(notes);
//     } catch (error) {
//         console.error("Error in getting all notes: ",error)
//         res.status(500).json({message: "Internal Server Error"})
//     }

// }; 


export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("❌ Error in getAllNotes:", error);
    console.error("Error details:", error.message);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}
// GET SINGLE NOTE - Check ownership
export async function getNotes(req, res) {
  try {
    const getNote = await Note.findById(req.params.id);
    if (!getNote) return res.status(404).json({ message: "Note not found" });
    
    // Check if note belongs to user
    if (getNote.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    res.status(200).json(getNote);
  } catch (error) {
    console.error("Error finding the note", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// CREATE NOTE - Add userId
export async function createANote(req, res) {
  try {
    const { title, content, tags } = req.body;
    const note = new Note({ 
      title, 
      content, 
      tags, 
      userId: req.userId  // Add this
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.log("Error writing notes: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// UPDATE NOTE - Check ownership
export async function updateNote(req, res) {
  try {
    const { title, content, tags, isPinned } = req.body;
    
    // First check if note exists and belongs to user
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, isPinned, updatedAt: Date.now() },
      { new: true }
    );
    
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("error updating the note: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// DELETE NOTE - Check ownership
export async function deleteNote(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "notes deleted successfully" });
  } catch (error) {
    console.error("Error deleting the note: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// TOGGLE PIN - Check ownership
export async function togglePinNote(req, res) {
  try {
    const { isPinned } = req.body;
    
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const updateData = { isPinned, updatedAt: Date.now() };
    if (isPinned) {
      updateData.pinnedAt = new Date();
    } else {
      updateData.pinnedAt = null;
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}