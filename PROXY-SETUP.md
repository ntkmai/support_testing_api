# Deploy Proxy Server lên Vercel

## Quick Start

1. **Đã có file**: `/api/proxy.js` ✅

2. **Deploy lên Vercel**:
```bash
# Nếu chưa cài Vercel CLI
npm i -g vercel

# Deploy
vercel
```

3. **Sử dụng**:

Sau khi deploy, proxy URL sẽ là:
```
https://your-app.vercel.app/api/proxy?url=
```

4. **Config trong Tool**:
- Settings → CORS Proxy
- Chọn "Custom URL"
- Nhập: `https://support-testing-api.vercel.app/api/proxy?url=`
- Lưu

## Test

```bash
# Test proxy
curl "https://your-app.vercel.app/api/proxy?url=http://ketoan.vtcode.vn:3006/api/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"55555","password":"55555"}'
```

## Lưu ý

- ✅ Không bị rate limit như CORS Anywhere
- ✅ Hoàn toàn free trên Vercel
- ✅ Hỗ trợ tất cả HTTP methods
- ✅ Forward Authorization header
- ⚠️ Vercel có giới hạn 10s timeout cho serverless function
