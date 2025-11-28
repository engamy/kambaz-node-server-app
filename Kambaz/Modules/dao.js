import { v4 as uuidv4 } from "uuid";

export default function ModulesDao(db) {
  function updateModule(moduleId, moduleUpdates) {
    const { modules } = db;
    const module = modules.find((module) => module._id === moduleId);
    if (!module) {
      return null;
    }
    Object.assign(module, moduleUpdates);
    return module;
  }
      
  function findModulesForCourse(courseId) {
    const { modules } = db;
    return modules.filter((module) => module.course === courseId);
  }
  
  function createModule(module) {
    const newModule = { ...module, _id: uuidv4() };
    db.modules = [...db.modules, newModule];
    return newModule;
  }

  function deleteModule(moduleId) {
    const { modules } = db;
    const moduleExists = modules.some((module) => module._id === moduleId);
    if (!moduleExists) {
      return false;
    }
    db.modules = modules.filter((module) => module._id !== moduleId);
    return true;
  }
      
  return {
    findModulesForCourse,
    createModule,
    deleteModule,
    updateModule,
  };
}
   