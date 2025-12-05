import ModulesDao from "../Modules/dao.js";

export default function ModulesRoutes(app, db) {
  const dao = ModulesDao(db);
  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);
  }  
  app.get("/api/courses/:courseId/modules", findModulesForCourse);

  const createModuleForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const module = {
        ...req.body,
        // course: courseId,
      };
      const newModule = await dao.createModule(courseId, module);
      res.json(newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Error creating module", error: error.message });
    }
  }
  app.post("/api/courses/:courseId/modules", createModuleForCourse);

  const deleteModule = async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      if (!moduleId) {
        res.status(400).json({ message: "Module ID is required" });
        return;
      }
      const deleted = await dao.deleteModule(courseId, moduleId);
      if (!deleted) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Error deleting module", error: error.message });
    }
  }
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);

  const updateModule = async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      if (!moduleId) {
        res.status(400).json({ message: "Module ID is required" });
        return;
      }
      const moduleUpdates = req.body;
      if (!moduleUpdates || typeof moduleUpdates !== 'object') {
        res.status(400).json({ message: "Invalid module data" });
        return;
      }
      const updatedModule = await dao.updateModule(courseId, moduleId, moduleUpdates);
      if (!updatedModule) {
        res.sendStatus(404);
        return;
      }
      res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Error updating module", error: error.message });
    }
  }
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
  
}
