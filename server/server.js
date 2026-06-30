require("dotenv").config();
const express = require("express");
const cors = require("cors");
const categoryRoutes = require("./routes/categories");
const storeRoutes = require("./routes/stores");
const searchRoutes = require("./routes/searchLogs");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hyperlocal Retail AI API is running" });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/search-logs", searchRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
