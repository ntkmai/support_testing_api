// commit-push.js
const { execSync } = require("child_process");

try {
  // git add .
  execSync("git add .", { stdio: "inherit" });

  // git commit -m "haha"
  execSync('git commit -m "haha"', { stdio: "inherit" });

  // git push
  execSync("git push", { stdio: "inherit" });

  console.log("✅ Đã commit và push thành công!");
} catch (error) {
  console.error("❌ Có lỗi xảy ra:", error.message);
}
