import { useState } from "react";

export default function ReceiptModal({ biz, form, items, subtotal, gst, total, onClose }) {
  const [sending, setSending] = useState(false);

  const fmt = (n) => "$" + (Math.round((n || 0) * 100) / 100).toFixed(2);

  const handleSend = async () => {
    if (!form.clientEmail || !/^\S+@\S+\.\S+$/.test(form.clientEmail)) {
      alert("Enter a valid client email first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items })
      });
      const result = await res.json();
      if (res.ok && result.ok) {
        alert("Receipt emailed to " + form.clientEmail);
        onClose();
      } else {
        alert(result.error || "Failed to send email");
      }
    } catch (err) {
      alert("Network error — could not reach server");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overlay show" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-head">
          <h3>Receipt preview</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="receipt-body">
          <p className="receipt-biz-name">{biz.name}</p>
          <p className="receipt-biz-meta">{biz.address}</p>
          <p className="receipt-biz-meta">
            Phone: {biz.phone} &nbsp;·&nbsp; ABN: {biz.abn}
          </p>
          <hr className="rline" />

          <div className="receipt-grid">
            <div><span>Invoice #:</span> {form.invNumber || "(not set)"}</div>
            <div><span>Date:</span> {form.invDate || "(not set)"}</div>
            <div><span>Bill to:</span> {form.clientName || "(not set)"}</div>
            <div><span>Client email:</span> {form.clientEmail || "(not set)"}</div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span>Address:</span> {form.clientAddress || ""}
            </div>
          </div>

          <table className="rtable">
            <thead>
              <tr>
                <th>SN</th>
                <th>Description</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.desc || "(no description)"}</td>
                  <td className="num">{fmt(Number(it.amt) || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="rtotals">
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

          {form.notes && <p className="receipt-footer-note">{form.notes}</p>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Back to edit
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? "Sending…" : "Send to client email"}
          </button>
        </div>
      </div>
    </div>
  );
}