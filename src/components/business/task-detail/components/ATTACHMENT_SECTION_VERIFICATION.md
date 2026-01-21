# AttachmentSection Component - Manual Verification Guide

## Overview
This document provides a manual verification checklist for the AttachmentSection component implementation.

## Test Data
The first task in the mock data (ID: `031A87D71AFB4EEA8E0B529F7A7C249F`) has been configured with 3 sample attachments:
1. 需求文档.pdf (1.22 MB) - PDF file
2. 系统架构图.png (512 KB) - PNG image
3. 数据库设计.xlsx (85.6 KB) - Excel file

## Verification Checklist

### 1. Display Functionality
- [ ] Open the task detail dialog for the first task
- [ ] Verify the "附件 (3)" section is displayed
- [ ] Verify all 3 attachments are listed
- [ ] Verify each attachment shows:
  - Appropriate file type icon (PDF, Image, Excel)
  - File name
  - Formatted file size

### 2. File Size Formatting
Verify the following file sizes are displayed correctly:
- [ ] 1245184 bytes → "1.22 MB"
- [ ] 524288 bytes → "512 KB"
- [ ] 87654 bytes → "85.6 KB"

### 3. File Type Icons
Verify the correct icons are displayed:
- [ ] PDF file shows Document icon
- [ ] PNG file shows Picture icon
- [ ] Excel file shows Files icon

### 4. Download Functionality
- [ ] Click the download button for each attachment
- [ ] Verify a success message "开始下载" is displayed
- [ ] Verify the browser attempts to download/open the file

### 5. Empty State
- [ ] Open a task detail dialog for a task without attachments
- [ ] Verify the empty state is displayed with message "暂无附件"
- [ ] Verify no attachment list is shown

### 6. Responsive Design
Desktop (>768px):
- [ ] Verify proper spacing and layout
- [ ] Verify hover effects on attachment items

Mobile (≤768px):
- [ ] Verify single column layout
- [ ] Verify reduced padding and font sizes
- [ ] Verify touch-friendly button sizes

### 7. Styling Consistency
- [ ] Verify section title matches other sections (16px, bold)
- [ ] Verify section has bottom border like other sections
- [ ] Verify padding matches other sections (20px vertical)

## Expected Behavior

### File Size Formatting Logic
```
0 B → "0 B"
1024 B → "1 KB"
1536 B → "1.5 KB"
1048576 B → "1 MB"
1572864 B → "1.5 MB"
1073741824 B → "1 GB"
```

### File Type Icon Mapping
- Images (image/*) → Picture icon
- Videos (video/*) → VideoCamera icon
- Audio (audio/*) → Headset icon
- Archives (zip, rar, 7z, tar, gz) → FolderOpened icon
- PDF (application/pdf) → Document icon
- Office docs (word, excel, powerpoint) → Files icon
- Default → Document icon

## Known Limitations
1. Download functionality creates a link and triggers click - may be blocked by popup blockers
2. File preview is not implemented - only download is supported
3. No file upload functionality in this component

## Browser Compatibility
Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Accessibility
- [ ] Verify keyboard navigation works (Tab to navigate, Enter to download)
- [ ] Verify screen reader announces attachment count
- [ ] Verify file names are readable by screen readers

## Performance
- [ ] Verify component renders quickly with 10+ attachments
- [ ] Verify no memory leaks when opening/closing dialog multiple times
- [ ] Verify smooth hover animations

## Integration
- [ ] Verify component is properly integrated in TaskDetailDialog
- [ ] Verify component receives correct props from parent
- [ ] Verify i18n translations work for both Chinese and English

## Notes
- The component uses Element Plus icons and components
- All text is internationalized using vue-i18n
- Styling follows the same pattern as BasicInfoSection and DescriptionSection
