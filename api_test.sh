#!/bin/bash

BASE_URL="http://localhost:8080/api"

if ! command -v curl &>/dev/null; then
  echo "'curl' is required."
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "'jq' is required."
  exit 1
fi

echo -e "\n-> GET /health"
curl -s -X GET "$BASE_URL/health" | jq .

echo -e "\n-> POST /echo"
curl -s -X POST "$BASE_URL/echo" -H "Content-Type: text/plain" -d "Hello Cartepro!"
echo ""

RANDOM_MAIL="test_$(date +%s)@example.com"

echo -e "\n-> POST /auth/register"
USER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"mail\": \"$RANDOM_MAIL\", \"name\": \"Test User\", \"password\": \"pass123\", \"role\": \"Manant\"}")

echo "$USER_RES" | jq .
USER_ID=$(echo "$USER_RES" | jq -r '.id')

echo -e "\n-> POST /auth/login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"mail\": \"$RANDOM_MAIL\", \"password\": \"pass123\"}" | jq .

echo -e "\n-> GET /user (Authentifié)"
curl -s -X GET "$BASE_URL/user" -H "Authorization: Bearer $USER_ID" | jq .

echo -e "\n-> PATCH /user (Update name)"
curl -s -X PATCH "$BASE_URL/user" \
  -H "Authorization: Bearer $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nom Modifié"}' | jq .

echo -e "\n-> POST /user/pass (Checking password)"
curl -s -o /dev/null -w "Code HTTP: %{http_code}\n" -X POST "$BASE_URL/user/pass" \
  -H "Authorization: Bearer $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"password": "pass123"}'

echo -e "\n--- EMPLOYEE ---"
echo "Creation:"
curl -s -X POST "$BASE_URL/employees" -H "Content-Type: application/json" \
  -d "{\"id\": \"$USER_ID\", \"balance\": 150.75}" | jq .
echo "Getting (All):"
curl -s -X GET "$BASE_URL/employees" | jq .
echo "Update:"
curl -s -X PUT "$BASE_URL/employees/$USER_ID" -H "Content-Type: application/json" \
  -d '{"balance": 200.00}' | jq .

echo -e "\n--- PARTNER ---"
echo "Creation:"
curl -s -X POST "$BASE_URL/partners" -H "Content-Type: application/json" \
  -d "{\"id\": \"$USER_ID\", \"siren\": 123456789, \"category\": \"Restauration\"}" | jq .
echo "Update:"
curl -s -X PUT "$BASE_URL/partners/$USER_ID" -H "Content-Type: application/json" \
  -d '{"highlight": true, "verification": true}' | jq .

echo -e "\n--- STATE ---"
echo "Creation:"
curl -s -X POST "$BASE_URL/states" -H "Content-Type: application/json" \
  -d "{\"id\": \"$USER_ID\", \"state\": \"active\", \"reason\": \"Inscription initiale\"}" | jq .
echo "Update:"
curl -s -X PUT "$BASE_URL/states/$USER_ID" -H "Content-Type: application/json" \
  -d '{"state": "suspended", "reason": "Test de suspension"}' | jq .

echo -e "\n--- ADMIN ---"
echo "Creation:"
curl -s -X POST "$BASE_URL/admins" -H "Content-Type: application/json" \
  -d "{\"id\": \"$USER_ID\"}" | jq .
echo "Admin get:"
curl -s -X GET "$BASE_URL/admins/$USER_ID" | jq .

echo -e "\n-> GET /v1/admin/transactions.csv"
curl -s -i -X GET "$BASE_URL/v1/admin/transactions.csv" | head -n 5

echo "Deleting relations..."
curl -s -o /dev/null -w "Admin deleted: %{http_code}\n" -X DELETE "$BASE_URL/admins/$USER_ID"
curl -s -o /dev/null -w "State deleted: %{http_code}\n" -X DELETE "$BASE_URL/states/$USER_ID"
curl -s -o /dev/null -w "Partner deleted: %{http_code}\n" -X DELETE "$BASE_URL/partners/$USER_ID"
curl -s -o /dev/null -w "Employee deleted: %{http_code}\n" -X DELETE "$BASE_URL/employees/$USER_ID"

echo -e "\nSuccessfull!"
