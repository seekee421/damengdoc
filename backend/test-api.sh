#!/bin/bash

# 测试达梦文档系统API接口
echo "=== 达梦文档系统API测试 ==="
echo

# 基础URL
BASE_URL="http://localhost:8080/api"

# 测试1: 检查应用状态
echo "1. 测试应用状态..."
curl -s "$BASE_URL/hello" || echo "应用可能未启动"
echo
echo

# 测试2: 用户注册
echo "2. 测试用户注册..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "realName": "测试用户"
  }' | jq '.' 2>/dev/null || echo "注册请求已发送"
echo
echo

# 测试3: 检查用户名可用性
echo "3. 测试用户名可用性检查..."
curl -s "$BASE_URL/auth/check-username?username=testuser" | jq '.' 2>/dev/null || echo "用户名检查请求已发送"
echo
echo

# 测试4: 检查邮箱可用性
echo "4. 测试邮箱可用性检查..."
curl -s "$BASE_URL/auth/check-email?email=test@example.com" | jq '.' 2>/dev/null || echo "邮箱检查请求已发送"
echo
echo

# 测试5: 获取用户统计
echo "5. 测试用户统计..."
curl -s "$BASE_URL/auth/stats" | jq '.' 2>/dev/null || echo "统计请求已发送"
echo
echo

# 测试6: H2数据库控制台
echo "6. H2数据库控制台地址:"
echo "   $BASE_URL/h2-console"
echo "   JDBC URL: jdbc:h2:mem:damengdb"
echo "   用户名: sa"
echo "   密码: (空)"
echo

echo "=== 测试完成 ==="