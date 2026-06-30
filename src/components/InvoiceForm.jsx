export default function InvoiceForm({
  form,
  setForm,
  items,
  setItems,
  setOpen,
  subtotal,
  gst,
  total
}) {
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: field === "amt" ? value : value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { desc: "", amt: 0 }]);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated.length ? updated : [{ desc: "", amt: 0 }]);
  };

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetInvoice = () => {
    setForm({
      invNumber: "",
      invDate: new Date().toISOString().slice(0, 10),
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      notes: ""
    });
    setItems([{ desc: "", amt: 0 }]);
  };

  const fmt = (n) => "$" + (Math.round((n || 0) * 100) / 100).toFixed(2);

  const handlePreview = () => {
    const hasAmount = items.some((it) => (Number(it.amt) || 0) > 0);
    if (!hasAmount) {
      alert("Add at least one service with an amount");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* ================= INVOICE DETAILS ================= */}
      <div className="panel">
        <h2 className="section-title">Invoice details</h2>

        <div className="grid2">
          <div className="field">
            <label>Invoice number</label>
            <input
              name="invNumber"
              value={form.invNumber}
              onChange={updateForm}
              placeholder="101"
            />
          </div>

          <div className="field">
            <label>Date</label>
            <input
              type="date"
              name="invDate"
              value={form.invDate}
              onChange={updateForm}
            />
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 6 }}>
          <div className="field">
            <label>Client name</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={updateForm}
              placeholder="Narayan Baral"
            />
          </div>

          <div className="field">
            <label>Client email (receipt sent here)</label>
            <input
              type="email"
              name="clientEmail"
              value={form.clientEmail}
              onChange={updateForm}
              placeholder="abc@example.com"
            />
          </div>
        </div>

        <div className="field">
          <label>Client address</label>
          <input
            name="clientAddress"
            value={form.clientAddress}
            onChange={updateForm}
            placeholder="128 Easty Street, Phillip ACT"
          />
        </div>
      </div>

      {/* ================= SERVICES ================= */}
      <div className="panel">
        <h2 className="section-title">Services</h2>

        <table>
          <thead>
            <tr>
              <th className="col-sn">SN</th>
              <th>Description</th>
              <th className="col-amt">Amount ($)</th>
              <th className="col-del"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="col-sn">{i + 1}</td>
                <td>
                  <input
                    value={item.desc}
                    onChange={(e) => updateItem(i, "desc", e.target.value)}
                    placeholder="e.g. General Cleaning"
                  />
                </td>
                <td className="col-amt">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amt}
                    onChange={(e) => updateItem(i, "amt", e.target.value)}
                  />
                </td>
                <td className="col-del">
                  <button className="del-btn" onClick={() => removeItem(i)} title="Remove">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-row" onClick={addItem}>
          + Add line
        </button>

        <div className="totals">
          <table>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td style={{ textAlign: "right" }}>{fmt(subtotal)}</td>
              </tr>
              <tr>
                <td>GST (10%)</td>
                <td style={{ textAlign: "right" }}>{fmt(gst)}</td>
              </tr>
              <tr className="grand">
                <td>Total</td>
                <td style={{ textAlign: "right" }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= NOTES ================= */}
      <div className="panel">
        <h2 className="section-title">Notes</h2>
        <textarea
          name="notes"
          value={form.notes}
          onChange={updateForm}
          placeholder="Thank you for choosing BN Visionary Cleaning Services."
        />
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={handlePreview}>
          Preview receipt
        </button>
        <button className="btn btn-ghost" onClick={resetInvoice}>
          Start new invoice
        </button>
      </div>
    </>
  );
}