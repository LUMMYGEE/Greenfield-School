# Deploy Firestore Rules

To deploy the updated Firestore security rules, run the following command in your terminal:

```bash
firebase deploy --only firestore:rules
```

## Alternative: Manual Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Click on "Rules" tab
5. Copy and paste the content from `firestore.rules` file
6. Click "Publish"

## Current Rules Summary

The updated rules allow:
- ✅ Authenticated users to create result submissions
- ✅ Teachers to read their own submissions
- ✅ Admins to read/update all submissions
- ✅ Basic CRUD operations for authenticated users on most collections
- ✅ Temporary permissive rules for development

## Security Notes

- All operations require authentication
- Teachers can only create submissions (not update/delete)
- Admins have full control over submissions
- User data is protected (users can only access their own data)
- Classes and subjects have role-based access control

## Testing

After deploying the rules, test the following:
1. Teacher can submit individual results
2. Teacher can submit bulk results
3. Teacher can view their submission history
4. Admin can view all submissions
5. Admin can approve/reject submissions

If you continue to get permission errors, try the temporary permissive rules by uncommenting the last rule in the firestore.rules file.