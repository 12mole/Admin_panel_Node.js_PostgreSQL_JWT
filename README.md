# Admin-panel-Node.js-PostgreSQL-JWT-

This is a secure web-based admin panel for managing registered users.  
Built with **Node.js (Express)**, **PostgreSQL**, and vanilla **HTML/CSS/JS**.

---

##  Installation

### 1 Clone repository
```
git clone https://github.com/12mole/Admin_panel_Node.js_PostgreSQL_JWT.git
cd Admin_panel_Node.js_PostgreSQL_JWT
```
### 2 Install dependencies
```
npm install
```
### 3 Configure environment variables  

In the **root folder** of the project, create a file named `.env` and copy the following content into it.  
Replace the values with your own database **login**, **password**, and **port** if different.  

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres        # Your PostgreSQL username
DB_PASSWORD=your_password  # Your PostgreSQL password
DB_NAME=user_admin
DB_PORT=5432            # Your PostgreSQL port (default: 5432)
JWT_SECRET=3a8f7c2e1b0d9f4a6c5b2e8d1f0a3c7e6b9a4d2f8c1e5a0b3d6f9c2e4a7b1d0f8e3c6a9b2
NODE_ENV=development
```
### 4 Initialize the database
#### Create database
```
psql -U postgres -c "CREATE DATABASE user_admin;"
```
#### Create tables and insert test data
```
psql -U postgres -d user_admin -f init-db.sql
```
### 5 Start the server
```
npm start
```
