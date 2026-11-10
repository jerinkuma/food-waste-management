FeedLink — Updated Full Replacement Files

Replace the files in your project with the matching paths in this package.

Updated files:
1. server/controllers/adminController.js
2. server/controllers/donationController.js
3. server/controllers/ngoController.js
4. client/src/services/api.js
5. client/src/services/socket.js
6. client/src/pages/Admindashboard/Dashboard.jsx
7. client/src/pages/DonorDashboard/Dashboard.jsx
8. client/src/pages/ngo/NGODashboard.jsx

What changed:
- Admin, Donor/Restaurant, and NGO dashboards use the shared Socket.IO client.
- Dashboard data refreshes after donation creation, selection, status changes, and distribution-proof submission.
- Donation status and completion dates are normalized across donor, NGO, and admin analytics.
- Completed-donation impact uses verification.verifiedAt or the Completed statusHistory timestamp; it does not substitute updatedAt/createdAt for a missing completion date.
- NGO statistics and completed-donation lists are tied to the actual selected/accepted NGO profile, not statusHistory.changedBy.
- The NGO distribution-proof action now selects from completed donations, and the backend accepts the existing image URL form as well as uploaded proof files.
- Already-selected donations are removed from the public NGO availability pool.
- Fixed the duplicate declaration syntax error in adminController.js and corrected the donor query used by admin reports.

Validation:
- Node syntax checks passed for the updated backend controllers, socket utility, and frontend service JavaScript files.
- A full Vite build was not run because node_modules was not included in the uploaded archive. After replacing the files, run:
    cd client
    npm install
    npm run build

Notes:
- server/utils/socket.js and server/routes/ngoRoutes.js were inspected and already matched the room names and completed-donation route used by these updates, so they are not included as replacements.
- No database records or environment variables were changed.
