export default function InvoiceList({ items, onDelete }) {
  return (
    <div>
      {items.length === 0 && <p>No items added</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span>{item.name}</span>
          <span>${item.price}</span>
          <span>Qty: {item.qty}</span>

          <button onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}