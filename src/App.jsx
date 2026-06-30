import { useState } from "react";
import "./styles/invoice.css";
import InvoiceForm from "./components/InvoiceForm";
import ReceiptModal from "./components/ReceiptModal";

const BIZ = {
  name: "BN Visionary Cleaning Services",
  address: "128 Easty Street, Phillip, ACT 2606",
  phone: "+61 0405120547",
  abn: "60 195 599 337"
};

export default function App() {
  const [items, setItems] = useState([{ desc: "", amt: 0 }]);

  const [form, setForm] = useState({
    invNumber: "",
    invDate: new Date().toISOString().slice(0, 10),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    notes: ""
  });

  const [open, setOpen] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (Number(i.amt) || 0), 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  return (
    <>
      {/* FIXED, NON-EDITABLE HEADER */}
      <div className="biz-header">
        <div className="biz-header-inner">
          <div>
            <p className="biz-name">{BIZ.name}</p>
            <p className="biz-line">{BIZ.address}</p>
          </div>
          <div className="biz-right">
            <p className="biz-line">Phone: {BIZ.phone}</p>
            <p className="biz-line">ABN: {BIZ.abn}</p>
          </div>
        </div>
      </div>

      <div className="wrap">
        <InvoiceForm
          form={form}
          setForm={setForm}
          items={items}
          setItems={setItems}
          setOpen={setOpen}
          subtotal={subtotal}
          gst={gst}
          total={total}
        />
      </div>

      {open && (
        <ReceiptModal
          biz={BIZ}
          form={form}
          items={items}
          subtotal={subtotal}
          gst={gst}
          total={total}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}