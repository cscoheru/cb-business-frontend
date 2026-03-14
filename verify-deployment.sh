#!/bin/bash

# CB-Business 功能验证脚本
# 快速验证前后端部署状态

echo "🚀 CB-Business 功能验证"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0
WARN=0

# 测试函数
test_api() {
    local name="$1"
    local url="$2"

    echo -n "测试 $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
        ((FAIL++))
        return 1
    fi
}

test_page() {
    local name="$1"
    local url="$2"
    local search="$3"

    echo -n "测试 $name... "

    content=$(curl -s "$url" | grep -o "$search" | head -1)

    if [ -n "$content" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (未找到 '$search')"
        ((FAIL++))
        return 1
    fi
}

# 开始测试
echo "📡 API 端点测试"
echo "---------------"
test_api "Opportunities Grades" "https://api.zenconsult.top/api/v1/opportunities/grades"
test_api "Opportunities Stats" "https://api.zenconsult.top/api/v1/opportunities/stats"
test_api "Opportunities Funnel" "https://api.zenconsult.top/api/v1/opportunities/funnel"
test_api "Data Collection Tasks Stats" "https://api.zenconsult.top/api/v1/data-collection-tasks/stats/summary"
echo ""

echo "🌐 前端页面测试"
echo "---------------"
test_page "首页加载" "https://www.zenconsult.top" "<title"
test_page "产品页面" "https://www.zenconsult.top/products" "产品"
test_page "卡片页面" "https://www.zenconsult.top/cards" "卡片"
test_page "定价页面" "https://www.zenconsult.top/pricing" "定价"
echo ""

echo "📊 数据验证"
echo "----------"
echo -n "验证商机数据... "
opp_count=$(curl -s "https://api.zenconsult.top/api/v1/opportunities?limit=1" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$opp_count" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS${NC} (找到 $opp_count 个商机)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️ WARN${NC} (无商机数据)"
    ((WARN++))
fi

echo -n "验证等级统计... "
grade_data=$(curl -s "https://api.zenconsult.top/api/v1/opportunities/grades" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
if [ "$grade_data" != "" ]; then
    echo -e "${GREEN}✅ PASS${NC} (等级API正常)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️ WARN${NC} (等级数据为空)"
    ((WARN++))
fi

echo ""

# 生成总结
echo "📋 测试总结"
echo "----------"
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo -e "${YELLOW}警告: $WARN${NC}"
echo ""

total=$((PASS + FAIL + WARN))
rate=$((PASS * 100 / total))

echo "总计: $total"
echo "通过率: $rate%"

if [ $rate -ge 80 ]; then
    echo -e "${GREEN}✅ 系统状态良好${NC}"
    exit 0
elif [ $rate -ge 60 ]; then
    echo -e "${YELLOW}⚠️  系统基本可用，需要优化${NC}"
    exit 0
else
    echo -e "${RED}❌ 系统存在问题，需要立即修复${NC}"
    exit 1
fi