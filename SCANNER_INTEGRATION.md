# 📱 Scanner App Integration Guide

## 🔗 **Scanner App Links Added**

I've integrated scanner app links throughout the main BookByBlock application for smooth redirection:

### **Navigation Links Added:**
- ✅ **Main Navigation** - Scanner link in top navbar (desktop & mobile)
- ✅ **Homepage Hero** - Scanner app button in hero section
- ✅ **Admin Dashboard** - Scanner access for event organizers

### **Environment Configuration:**
```bash
# Frontend .env
NEXT_PUBLIC_SCANNER_URL=https://scanner.bookbyblock.com
```

## 🚀 **Deployment Strategy**

### **Recommended URLs:**
- **Main App**: `bookbyblock.com`
- **Scanner App**: `scanner.bookbyblock.com`

### **Alternative Options:**
- **Main App**: `bookbyblock.com`
- **Scanner App**: `scan.bookbyblock.com`

## 📱 **User Flow:**

1. **Event Organizers** create events via main app
2. **Users** buy tickets via main app
3. **Entry Staff** click "Scanner App" link → redirects to scanner subdomain
4. **Scanner app** verifies tickets independently

## 🔧 **Configuration:**

### **Main App Environment:**
```bash
NEXT_PUBLIC_BACKEND_URL=your-backend-url
NEXT_PUBLIC_SCANNER_URL=https://scanner.bookbyblock.com
```

### **Scanner App Environment:**
```bash
NEXT_PUBLIC_BACKEND_URL=your-backend-url
```

## ✅ **Integration Complete:**

- **Seamless Navigation** - Users can easily access scanner from main app
- **Independent Deployment** - Scanner remains separate application
- **Consistent Branding** - Scanner links styled to match main app
- **Mobile Optimized** - Scanner links work on all devices

**Both apps now work together while remaining independently deployable!**
