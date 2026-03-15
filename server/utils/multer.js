import multer from "multer";

// Use memory storage — works reliably on Vercel serverless
// (disk paths in /tmp can be unreliable across function invocations).
const upload = multer({ storage: multer.memoryStorage() });
export default upload;