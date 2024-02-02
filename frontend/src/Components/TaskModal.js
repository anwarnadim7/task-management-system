import React from "react";
import { Modal, Button } from "react-bootstrap";

function TaskModal({
  show,
  handleClose,
  handleSubmit,
  task,
  setTask,
  modalTitle,
  submitButtonText,
}) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label htmlFor="modalTitle" className="form-label">
            Title:
          </label>
          <input
            type="text"
            className="form-control"
            id="modalTitle"
            value={task ? task.title : ""}
            onChange={(e) =>
              setTask((prevTask) => ({ ...prevTask, title: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="modalDescription" className="form-label">
            Description:
          </label>
          <textarea
            className="form-control"
            id="modalDescription"
            value={task ? task.description : ""}
            onChange={(e) =>
              setTask((prevTask) => ({
                ...prevTask,
                description: e.target.value,
              }))
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="modalDueDate" className="form-label">
            Due Date:
          </label>
          <input
            type="date"
            className="form-control"
            id="modalDueDate"
            value={task ? task.duedate : ""}
            onChange={(e) =>
              setTask((prevTask) => ({ ...prevTask, duedate: e.target.value }))
            }
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={handleSubmit}>
          {submitButtonText}
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TaskModal;
