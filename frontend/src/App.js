import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import TaskModal from "./Components/TaskModal";
import clipboardImage from "./clipboard-logo.svg";
import axios from "axios";
import { BsPencil, BsTrash3 } from "react-icons/bs";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";

function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState({
    title: "",
    description: "",
    duedate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3300/tasks?page=${currentPage}&limit=${tasksPerPage}&sortBy=duedate`
        );
        setTasks(response.data.tasks);  // update state with tasks array directly
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentPage, tasksPerPage]);



  const handleMarkAsComplete = async (taskId, completed) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, completed: !completed } : task
        )
      );

      await axios.put(`http://localhost:3300/tasks/${taskId}`, {
        completed: !completed,
      });
    } catch (error) {
      console.error("Error toggling task completeness:", error);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, completed } : task
        )
      );
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:3300/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTask({ title: "", description: "", duedate: "" });
  };

  const handleModalSubmit = async () => {
    try {
        if (modalTask._id) {
            const response = await axios.put(
                `http://localhost:3300/tasks/${modalTask._id}`,
                modalTask
            );
            if (response.status === 200) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task._id === modalTask._id ? modalTask : task
                    )
                );
            } else {
                console.error("Error editing task");
            }
        } else {
            const response = await axios.post(
                "http://localhost:3300/tasks",
                modalTask
            );
            if (response.status === 201) {
                setTasks((prevTasks) => [...prevTasks, response.data]);
            } else {
                console.error("Error adding task");
            }
        }
    } catch (error) {
        console.error("Error submitting task:", error);
    } finally {
        handleCloseModal();
    }
};
  const handleShowModal = (task = null) => {
    setShowModal(true);
    setModalTask(task || { title: "", description: "", duedate: "" });
  };

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom border-2 border-dark sticky-top bg-white d-flex justify-content-between">
        <a
          href="/"
          className="d-flex align-items-center text-body-emphasis text-decoration-none"
        >
          <img src={clipboardImage} height={30} alt="Clipboard Logo" />
          <span className="fs-4">&nbsp;Task Tracker Application</span>
        </a>
        <Button
          variant="primary"
          size="xs"
          onClick={() => handleShowModal()}
          className="btn-dark"
        >
          Add Task
        </Button>
      </header>
      <div className="container">
        <div className="row">
          <div className="col">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  className="card bg-default border border-dark mb-3 py-2"
                  key={task._id}
                >
                  <div className="card-body">
                    <div className="row">
                      <div className="col-5">
                        <div className="part">
                          <strong>{task.title}</strong>
                          <br />
                          {task.description}
                          <br />
                          Due Date:{" "}
                          {task.duedate
                            ? formatDate(task.duedate)
                            : "No due date"}
                        </div>
                      </div>
                      <div className="col-2">
                        <div className="part">
                          <label>
                            {task.completed ? (
                              <span className="badge bg-success text-light">
                                Completed
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Progress
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                      <div className="col-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-dark me-2"
                          onClick={() =>
                            handleMarkAsComplete(task._id, task.completed)
                          }
                          disabled={loading}
                        >
                          {task.completed
                            ? "Mark As Incomplete"
                            : "Mark As Complete"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark me-2"
                          onClick={() => handleShowModal(task)}
                          disabled={task.completed || loading}
                        >
                          <BsPencil />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => handleDelete(task._id)}
                          disabled={task.completed || loading}
                        >
                          <BsTrash3 />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-5">
                <p>No tasks available</p>
              </div>
            )}
          </div>
          <div className="pagination py-4">
            <button
              className="btn btn-default btn-sm"
              onClick={() =>
                setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
              }
              disabled={currentPage === 1 || loading}
            >
              <GoArrowLeft />
            </button>
            <button
              className="btn btn-default btn-sm"
              onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
              disabled={tasks.length < tasksPerPage || loading}
            >
              <GoArrowRight />
            </button>
          </div>
        </div>
      </div>

      <TaskModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleModalSubmit}
        task={modalTask}
        setTask={setModalTask}
        modalTitle={modalTask._id ? "Edit Task" : "Add Task"}
        submitButtonText={modalTask._id ? "Edit Task" : "Add Task"}
      />
    </div>
  );
}

export default App;
