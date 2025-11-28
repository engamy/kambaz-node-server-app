import ModulesDao from "../Modules/dao.js";
export default function ModulesRoutes(app, db) {
  const dao = ModulesDao(db);

  const findModulesForCourse = (req, res) => {
    const { courseId } = req.params;
    const modules = dao.findModulesForCourse(courseId);
    res.json(modules);
  }
  app.get("/api/courses/:courseId/modules", findModulesForCourse);

  const createModuleForCourse = (req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const module = {
        ...req.body,
        course: courseId,
      };
      const newModule = dao.createModule(module);
      res.json(newModule);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Error creating module", error: error.message });
    }
  }
  app.post("/api/courses/:courseId/modules", createModuleForCourse);

  const deleteModule = (req, res) => {
    try {
      const { moduleId } = req.params;
      if (!moduleId) {
        res.status(400).json({ message: "Module ID is required" });
        return;
      }
      const deleted = dao.deleteModule(moduleId);
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
  app.delete("/api/modules/:moduleId", deleteModule);

  const updateModule = (req, res) => {
    try {
      const { moduleId } = req.params;
      if (!moduleId) {
        res.status(400).json({ message: "Module ID is required" });
        return;
      }
      const moduleUpdates = req.body;
      if (!moduleUpdates || typeof moduleUpdates !== 'object') {
        res.status(400).json({ message: "Invalid module data" });
        return;
      }
      const updatedModule = dao.updateModule(moduleId, moduleUpdates);
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
  app.put("/api/modules/:moduleId", updateModule);
  
}
