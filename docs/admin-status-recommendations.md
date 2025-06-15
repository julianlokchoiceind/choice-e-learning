# Admin Module Status Recommendations

Based on research of best practices for content management systems, here are the recommendations for status fields in the Choice E-Learning admin modules:

## Current Status Implementation

### Course Module
- Uses **Draft/Published** status pattern
- Appropriate for content that needs review before going live
- Includes DraftStatusBadge component

### Lesson Module  
- Uses **Draft/Published** status pattern
- Consistent with Course module
- Now uses StatusBadge component

### Topic Module
- Uses **Active/Inactive** status pattern
- Topics are more like categories/tags that are either available or not

## Recommendations

### 1. FAQ Module
**Recommendation: Use Active/Inactive pattern**

**Rationale:**
- FAQs are typically simple Q&A pairs that don't need complex workflows
- They are either visible to users or hidden
- No need for draft/review process as they're usually reviewed before creation
- Active/Inactive allows admins to temporarily hide FAQs without deleting them

**Implementation:**
- Add `isActive` boolean field to FAQ model
- Default to `true` (active) for new FAQs
- Use StatusBadge component with 'active'/'inactive' status

### 2. Student Module  
**Recommendation: Use Active/Inactive pattern**

**Rationale:**
- Students are user accounts, not content
- Account should be either active (can login) or inactive (suspended/disabled)
- No concept of "draft" student makes sense
- Aligns with standard user management practices

**Implementation:**
- Add `isActive` boolean field to User model for students
- Default to `true` (active) for new students
- Use StatusBadge component with 'active'/'inactive' status

### 3. Topic Module
**Current implementation is correct**
- Already uses Active/Inactive pattern appropriately
- Topics are taxonomies that are either available for use or not

## Summary

The general rule is:
- **Draft/Published**: For content that needs creation/review workflow (Courses, Lessons)
- **Active/Inactive**: For entities that are either available or not (Topics, FAQs, Students)

This approach provides consistency while respecting the different nature of each entity type in the system.