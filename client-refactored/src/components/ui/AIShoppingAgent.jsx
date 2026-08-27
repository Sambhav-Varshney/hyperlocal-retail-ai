import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useCart } from "../../context/CartContext";
import { executeAgentQuery } from "../../utils/aiAgentEngine";
import { currency } from "../../utils/format";
import { formatDistance } from "../../utils/distanceUtils";

function AIShoppingAgent() {
  const { stores, location, addToCompare, saveStore } = useData();
  const { addToCart } = useCart();
  const [prompt, setPrompt] = useState("");
  const [activeResult, setActiveResult] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [newListItem, setNewListItem] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const samplePrompts = [
    "Find cheapest milk near me",
    "Best shampoo under ₹300",
    "Find Maggi near me",
    "Milk, Bread, Eggs, Biscuits. Budget: ₹400",
  ];

  const handleRunAgent = (queryToRun) => {
    const q = queryToRun !== undefined ? queryToRun : prompt;
    if (!q || !q.trim()) return;

    const result = executeAgentQuery(q, stores, location);
    setActiveResult(result);
  };

  const handleAddToList = (itemName) => {
    if (!itemName) return;
    if (!shoppingList.includes(itemName)) {
      setShoppingList((prev) => [...prev, itemName]);
    }
  };

  const handleRemoveFromList = (index) => {
    setShoppingList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearchForList = () => {
    if (shoppingList.length === 0) return;
    const combinedQuery = shoppingList.join(", ");
    setPrompt(combinedQuery);
    handleRunAgent(combinedQuery);
  };

  return (
    <section
      className="panel ai-agent-container"
      aria-label="BazaarHub AI Shopping Assistant"
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.6rem" }}>✨</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 750 }}>
                BazaarHub AI Assistant
              </h2>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--primary)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  fontWeight: 650,
                }}
              >
                ⚡ Catalog Demo Data
              </span>
            </div>
            <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              Intelligent local shopping decision support & price optimization
            </p>
          </div>
        </div>

        <button
          type="button"
          className="ghost-action"
          style={{ padding: "6px 12px", fontSize: "0.82rem", borderRadius: "10px" }}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "Collapse ▲" : "Expand ✨"}
        </button>
      </div>

      {isExpanded ? (
        <>
          {/* Quick Prompts */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center", fontWeight: 650 }}>
              Try asking:
            </span>
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="ghost-action"
                style={{
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  color: "var(--text-main)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setPrompt(sample);
                  handleRunAgent(sample);
                }}
              >
                "{sample}"
              </button>
            ))}
          </div>

          {/* Prompt Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAgent();
            }}
            style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What are you shopping for? (e.g. 'Cheapest milk near me' or 'Groceries under ₹400')"
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              className="primary-action"
              style={{
                padding: "12px 24px",
                background: "var(--primary)",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: 750,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Find Best Options ➔
            </button>
          </form>

          {/* AI Result Presentation Panel */}
          {activeResult ? (
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                marginBottom: "20px",
              }}
            >
              {activeResult.type === "single_recommendation" ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 750, textTransform: "uppercase" }}>
                      🤖 AI Recommendation for "{activeResult.query}"
                    </span>
                    <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                      {activeResult.confidence}
                    </span>
                  </div>

                  {/* Primary Recommended Item Card */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                      padding: "16px",
                      borderRadius: "14px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "1.1rem", color: "var(--text-main)", display: "block" }}>
                        {activeResult.recommendedItem.productName}
                      </strong>
                      <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                        🏬 {activeResult.recommendedItem.storeName} • ⭐ {Number(activeResult.recommendedItem.rating || 4.5).toFixed(1)} {activeResult.recommendedItem.distance ? `• 📍 ${formatDistance(activeResult.recommendedItem.distance)}` : ""}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "1.4rem", color: "#22C55E", display: "block" }}>
                        {currency(activeResult.recommendedItem.price)}
                      </strong>
                    </div>
                  </div>

                  {/* Why I Selected It Bullets */}
                  <div style={{ marginBottom: "16px" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                      Why I selected this option:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {activeResult.reasons.map((reason, idx) => (
                        <li key={idx} style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>
                          ✓ {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="primary-action"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      onClick={() => addToCart(activeResult.recommendedItem, activeResult.recommendedItem)}
                    >
                      🛒 Add to Basket
                    </button>
                    <button
                      type="button"
                      className="ghost-action"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}
                      onClick={() => addToCompare(activeResult.recommendedItem)}
                    >
                      ⚖️ Add to Compare
                    </button>
                    <button
                      type="button"
                      className="ghost-action"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}
                      onClick={() => saveStore(activeResult.recommendedItem)}
                    >
                      ⭐ Save Store
                    </button>
                    <button
                      type="button"
                      className="ghost-action"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}
                      onClick={() => handleAddToList(activeResult.recommendedItem.productName)}
                    >
                      📋 Add to Shopping List
                    </button>
                  </div>
                </div>
              ) : activeResult.type === "basket_recommendation" ? (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 750, textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                    🛒 AI Basket & Budget Optimizer
                  </span>
                  <p style={{ color: "var(--text-main)", fontSize: "0.92rem", marginBottom: "14px", fontWeight: 600 }}>
                    {activeResult.explanation}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    {activeResult.basketResults.map((bItem, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>
                          ✓ {bItem.productName} ({bItem.storeName})
                        </span>
                        <strong style={{ color: "#22C55E" }}>{currency(bItem.price)}</strong>
                      </div>
                    ))}
                  </div>

                  {activeResult.missingItems.length > 0 ? (
                    <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#EF4444", fontSize: "0.85rem", marginBottom: "16px" }}>
                      ⚠️ I couldn't find a matching product for: {activeResult.missingItems.join(", ")} in the current catalog.
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="primary-action"
                    style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                    onClick={() => {
                      activeResult.basketResults.forEach((b) => addToCart(b.item, b.item));
                    }}
                  >
                    🛒 Add All Basket Items to Cart
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", margin: 0 }}>{activeResult.message}</p>
              )}
            </div>
          ) : null}

          {/* Simple Shopping List Generator (Stage 8 Foundation) */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "14px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📋</span>
                <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>My AI Shopping List</strong>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>({shoppingList.length} items)</span>
              </div>
              {shoppingList.length > 0 ? (
                <button
                  type="button"
                  className="primary-action"
                  style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                  onClick={handleSearchForList}
                >
                  🔍 Find Best Prices for List
                </button>
              ) : null}
            </div>

            {/* Quick Add Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newListItem.trim()) {
                  handleAddToList(newListItem.trim());
                  setNewListItem("");
                }
              }}
              style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
            >
              <input
                value={newListItem}
                onChange={(e) => setNewListItem(e.target.value)}
                placeholder="Add item to shopping list... (e.g. Milk, Bread, Butter)"
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                }}
              />
              <button
                type="submit"
                className="ghost-action"
                style={{ padding: "8px 14px", fontSize: "0.82rem", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-main)" }}
              >
                + Add
              </button>
            </form>

            {/* List items */}
            {shoppingList.length > 0 ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {shoppingList.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                    }}
                  >
                    ☐ {item}
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0 2px" }}
                      onClick={() => handleRemoveFromList(idx)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Shopping list is empty. Type above or click 'Add to Shopping List' on any AI recommendation.
              </p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default AIShoppingAgent;
