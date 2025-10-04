import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ApprovalRulesPage() {
  const [manager, setManager] = useState('sarah');
  const [approvers, setApprovers] = useState([
    { name: 'John', checked: true },
    { name: 'Mitchell', checked: false },
    { name: 'Andreas', checked: false }
  ]);
  const [isManagerApprover, setIsManagerApprover] = useState(false);
  const [isSequential, setIsSequential] = useState(false);
  const [approvalPercent, setApprovalPercent] = useState('');

  return (
    <div className="container py-5 bg-light min-vh-100">
      <h1 className="mb-4 fw-bold">Admin View (Approval Rules)</h1>

      <div className="card shadow-lg">
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label fw-semibold">User</label>
            <input type="text" className="form-control" placeholder="marc" />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Description about rules</label>
            <input type="text" className="form-control" placeholder="Approval rule for miscellaneous expenses" />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Manager</label>
            <select className="form-select" value={manager} onChange={(e) => setManager(e.target.value)}>
              <option value="sarah">Sarah</option>
              <option value="alex">Alex</option>
              <option value="nina">Nina</option>
            </select>
            <small className="text-muted">
              Dynamic dropdown: initially set to user’s assigned manager, can be changed by admin.
            </small>
          </div>

          <div className="border-top pt-3 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isManagerApprover}
                onChange={() => setIsManagerApprover(!isManagerApprover)}
                id="managerApprover"
              />
              <label className="form-check-label" htmlFor="managerApprover">
                Is manager an approver?
              </label>
            </div>
            <small className="text-muted">
              If checked, approval requests go to the manager before other approvers.
            </small>
          </div>

          <div className="mb-3">
            <h5 className="fw-semibold">Approvers</h5>
            {approvers.map((a, i) => (
              <div key={i} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={a.checked}
                  onChange={(e) => {
                    const updated = [...approvers];
                    updated[i].checked = e.target.checked;
                    setApprovers(updated);
                  }}
                  id={`approver-${i}`}
                />
                <label className="form-check-label" htmlFor={`approver-${i}`}>
                  {a.name}
                </label>
              </div>
            ))}
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isSequential}
              onChange={() => setIsSequential(!isSequential)}
              id="sequence"
            />
            <label className="form-check-label" htmlFor="sequence">
              Approvers Sequence
            </label>
          </div>

          <p className="text-muted">
            If checked, requests follow the listed sequence (John → Mitchell → Andreas). If unchecked, all approvers receive the request simultaneously.
          </p>

          <div className="d-flex align-items-center gap-2 mb-3">
            <label className="fw-semibold">Minimum Approval Percentage:</label>
            <input
              type="number"
              className="form-control w-auto"
              style={{ width: '100px' }}
              placeholder="%"
              value={approvalPercent}
              onChange={(e) => setApprovalPercent(e.target.value)}
            />
            <span>%</span>
          </div>

          <div className="pt-3">
            <button className="btn btn-primary">Save Approval Rule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalRulesPage;
