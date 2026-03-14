'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CostCalculatorPage() {
  const [cost, setCost] = useState('');
  const [shipping, setShipping] = useState('');
  const [fees, setFees] = useState('');
  const [price, setPrice] = useState('');
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);

  const calculate = () => {
    const costValue = parseFloat(cost) || 0;
    const shippingValue = parseFloat(shipping) || 0;
    const feesValue = parseFloat(fees) || 0;
    const priceValue = parseFloat(price) || 0;

    const totalCost = costValue + shippingValue + feesValue;
    const profitValue = priceValue - totalCost;
    const marginValue = priceValue > 0 ? (profitValue / priceValue) * 100 : 0;

    setProfit(profitValue);
    setMargin(marginValue);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Link href="/dashboard">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          返回仪表盘
        </button>
      </Link>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💰 成本计算器</h1>
        <p className="text-gray-600">
          计算产品成本和利润，帮助您做出更好的定价决策
        </p>
      </div>

      {/* 计算表单 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品成本 (USD)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 10.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              运费 (USD)
            </label>
            <input
              type="number"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 5.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              平台费用 (USD)
            </label>
            <input
              type="number"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 3.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              售价 (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 25.00"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          计算利润
        </button>
      </div>

      {/* 结果展示 */}
      {(profit !== 0 || margin !== 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">计算结果</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-1">总成本</div>
              <div className="text-2xl font-bold text-gray-900">
                ${((parseFloat(cost || '0') + parseFloat(shipping || '0') + parseFloat(fees || '0')).toFixed(2))}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-sm text-gray-600 mb-1">利润</div>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-sm text-gray-600 mb-1">利润率</div>
              <div className={`text-2xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {margin.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* 利润率指示 */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">利润率</span>
              <span className={`font-medium ${margin >= 20 ? 'text-green-600' : margin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {margin >= 20 ? '优秀' : margin >= 10 ? '良好' : margin >= 0 ? '较低' : '亏损'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  margin >= 20 ? 'bg-green-500' : margin >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 产品成本包括采购价格、包装等直接成本</li>
          <li>• 运费包括国际运输和本地配送费用</li>
          <li>• 平台费用包括Amazon、Shopee等平台佣金</li>
          <li>• 建议利润率保持在 20% 以上以获得健康的收益</li>
        </ul>
      </div>
    </div>
  );
}
