const assignment = {
  id: 1, title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10", completed: false, score: 0,
};

const module = {
  id: "CS4550",
  name: "Web Development",
  description: "Full Stack Web Development with React and Node.js",
  course: "CS4550"
};

export default function WorkingWithObjects(app) {
    //get entire assignment
  const getAssignment = (req, res) => {
    res.json(assignment);
  };
  app.get("/lab5/assignment", getAssignment);

  // get assignment title
  const getAssignmentTitle = (req, res) => {
    res.json(assignment.title);
  };
  app.get("/lab5/assignment/title", getAssignmentTitle);

  // modify assignment title
  const setAssignmentTitle = (req, res) => {
    const { newTitle } = req.params;
    assignment.title = newTitle;
    res.json(assignment);
  };
  app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);

  // get entire module
  const getModule = (req, res) => {
    res.json(module);
  };
  app.get("/lab5/module", getModule);

  // get module name
  const getModuleName = (req, res) => {
    res.json(module.name);
  };
  app.get("/lab5/module/name", getModuleName);

  // modify module description
  const setModuleDescription = (req, res) => {
    const { newDescription } = req.params;
    module.description = decodeURIComponent(newDescription);
    res.json(module);
  };
  app.get("/lab5/module/description/:newDescription", setModuleDescription);
};