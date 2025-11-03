#!/bin/bash
echo "Please enter your MySQL root password:"
read -s mysql_password
echo ""
echo "Updating .env file with MySQL password..."
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$mysql_password/" .env
echo "✅ Password updated in .env file"
echo "Current DB_PASSWORD line:"
grep "^DB_PASSWORD" .env
