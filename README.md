# Pockets for Everyone
live here: http://www.pocketsforeveryone.com/

Pockets provides a space for members to communicate about their experiences buying clothing with a focus on clothing vendors that are gender-inclusive. This app uses MongoDB, Express, and Node. Users can add vendor pages and comment on existing vendors. A user can have either a standard user role or an admin role. To moderate content, users can report vendors or comments. If a vendor or comment has been reported by multiple users, it will be hidden from the page unless approved by an admin. Admins have special permissions that standard users do not, such as the ability to approve flagged content, edit/delete any vendor/comment, and view messages sent to admins. 

# User Features: 
* register
* login
* add new vendor
* edit owned vendors
* delete owned vendors
* report any vendor
* add comments to vendors
* edit owned comments
* delete owned comments
* report any comment
* user page to view all vendors created by a user

# Moderation Features
* To avoid inappropriate photos, only unsplash photos are accepted 
* user-reported comments/vendors will be hidden from that user
* comments/vendors reported by multiple users will be hidden from all users
* admin can approve or delete reported comments
* if a user edits an approved comment, the comment must regain admin approval if flagged 