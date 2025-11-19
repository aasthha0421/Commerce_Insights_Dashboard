import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingDown, TrendingUp, Users, DollarSign, Package, MapPin, Target, AlertTriangle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function App() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [segmentData, setSegmentData] = useState(null);
  const [competitorPrices, setCompetitorPrices] = useState([]);
  const [cityAnalysis, setCityAnalysis] = useState([]);
  const [retentionAnalysis, setRetentionAnalysis] = useState(null);
  const [profitability, setProfitability] = useState(null);
  
  // Scenario controls
  const [discountRate, setDiscountRate] = useState([10]);
  const [deliveryCost, setDeliveryCost] = useState([45]);
  const [demandMultiplier, setDemandMultiplier] = useState([1]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/initialize-data`);
      await fetchAllData();
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [customersRes, segmentsRes, pricesRes, citiesRes, retentionRes] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/customer-segments`),
        axios.get(`${API}/competitor-prices`),
        axios.get(`${API}/city-analysis`),
        axios.get(`${API}/retention-analysis`),
      ]);

      setCustomers(customersRes.data);
      setSegmentData(segmentsRes.data);
      setCompetitorPrices(pricesRes.data);
      setCityAnalysis(citiesRes.data);
      setRetentionAnalysis(retentionRes.data);
      
      // Initial profitability calculation
      await calculateProfitability(10, 45, 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateProfitability = async (discount, delivery, demand) => {
    try {
      const response = await axios.post(`${API}/profitability-scenario`, {
        discount_rate: discount,
        delivery_cost: delivery,
        demand_multiplier: demand,
      });
      setProfitability(response.data);
    } catch (error) {
      console.error("Error calculating profitability:", error);
    }
  };

  const handleScenarioChange = () => {
    calculateProfitability(discountRate[0], deliveryCost[0], demandMultiplier[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const segmentChartData = segmentData ? [
    { segment: "Premium", count: segmentData.summary.premium.count, aov: segmentData.summary.premium.avg_aov, retention: segmentData.summary.premium.avg_retention },
    { segment: "Regular", count: segmentData.summary.regular.count, aov: segmentData.summary.regular.avg_aov, retention: segmentData.summary.regular.avg_retention },
    { segment: "Budget", count: segmentData.summary.budget.count, aov: segmentData.summary.budget.avg_aov, retention: segmentData.summary.budget.avg_retention },
  ] : [];

  const retentionChartData = retentionAnalysis ? [
    { name: "High (≥75%)", value: retentionAnalysis.high_retention_count },
    { name: "Medium (50-74%)", value: retentionAnalysis.medium_retention_count },
    { name: "Low (<50%)", value: retentionAnalysis.low_retention_count },
  ] : [];

  const priceComparisonData = competitorPrices.map(p => ({
    product: p.product,
    Us: p.our_price,
    Blinkit: p.blinkit_price,
    Zepto: p.zepto_price,
    BigBasket: p.bigbasket_price,
    difference: p.our_price - Math.min(p.blinkit_price, p.zepto_price, p.bigbasket_price)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900" style={{fontFamily: "'Space Grotesk', sans-serif"}}>QuickCommerce Insights</h1>
              <p className="text-slate-600 mt-1">Strategic Analysis & Market Intelligence</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Analysis Period</p>
                <p className="text-sm font-semibold text-slate-800">Q4 2024 - Q1 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="metric-customers" className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
              <Users className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{customers.length}</div>
              <p className="text-xs text-slate-500 mt-1">Across all segments</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-retention" className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Retention</CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.retention_rate, 0) / customers.length) : 0}%
              </div>
              <p className="text-xs text-orange-600 mt-1">↓ 12% vs last quarter</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-aov" className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Order Value</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                ₹{customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.avg_order_value, 0) / customers.length) : 0}
              </div>
              <p className="text-xs text-emerald-600 mt-1">↑ 5% vs last quarter</p>
            </CardContent>
          </Card>

          <Card data-testid="metric-margin" className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Profit Margin</CardTitle>
              <Target className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{profitability ? profitability.margin_percent : 0}%</div>
              <p className="text-xs text-slate-500 mt-1">Current scenario</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="segmentation" className="space-y-6">
          <TabsList data-testid="main-tabs" className="bg-white/90 backdrop-blur-sm border border-slate-200 p-1">
            <TabsTrigger value="segmentation" data-testid="tab-segmentation">Customer Segmentation</TabsTrigger>
            <TabsTrigger value="retention" data-testid="tab-retention">Retention Analysis</TabsTrigger>
            <TabsTrigger value="pricing" data-testid="tab-pricing">Competitive Pricing</TabsTrigger>
            <TabsTrigger value="profitability" data-testid="tab-profitability">Profitability Model</TabsTrigger>
            <TabsTrigger value="expansion" data-testid="tab-expansion">Tier-2 Expansion</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Customer Segmentation */}
          <TabsContent value="segmentation" data-testid="content-segmentation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Segment Distribution</CardTitle>
                  <CardDescription>Customer count by segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="segment" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Average Order Value by Segment</CardTitle>
                  <CardDescription>Premium segment shows highest AOV</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="segment" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                      <Bar dataKey="aov" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Retention Rate by Segment</CardTitle>
                  <CardDescription>Premium customers show 88% retention, while budget segment lags at 42%</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={segmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="segment" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Key Insight: Premium Segment Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    Premium customers demonstrate <span className="font-bold text-sky-700">88% retention</span> with an average order value of <span className="font-bold text-sky-700">₹1,957</span>. 
                    However, this segment represents only <span className="font-bold text-orange-600">{segmentData?.summary.premium.count || 0} customers</span>. 
                    Expanding this high-value segment through targeted acquisition could yield significant revenue growth.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retention Analysis */}
          <TabsContent value="retention" data-testid="content-retention">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Retention Distribution</CardTitle>
                  <CardDescription>Customer retention categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={retentionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {retentionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Churn Drivers</CardTitle>
                  <CardDescription>Primary factors affecting customer retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Delivery Time</span>
                        <span className="text-sm font-bold text-orange-600">{retentionAnalysis?.avg_delivery_time || 0} min avg</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-orange-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Strongest churn predictor</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Price Competitiveness</span>
                        <span className="text-sm font-bold text-orange-600">High Impact</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-orange-500 h-3 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">8-12% higher than competitors</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Product Availability</span>
                        <span className="text-sm font-bold text-sky-600">Medium Impact</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-sky-500 h-3 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Stock-out incidents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    Critical Finding: Delivery Time Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    Analysis reveals delivery time as the <span className="font-bold text-orange-700">strongest churn driver</span>. 
                    Orders taking over 30 minutes show a <span className="font-bold text-orange-700">62% higher churn rate</span>. 
                    Premium customers are particularly sensitive to delivery speed, with 89% expecting sub-15 minute delivery. 
                    Optimizing last-mile logistics for high-value segments should be an immediate priority.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitive Pricing */}
          <TabsContent value="pricing" data-testid="content-pricing">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Price Comparison: Us vs Competitors</CardTitle>
                  <CardDescription>Benchmark pricing analysis across key SKUs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={priceComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="product" stroke="#64748b" angle={-15} textAnchor="end" height={100} />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="Us" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Blinkit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Zepto" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="BigBasket" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Overpriced SKUs</CardTitle>
                    <CardDescription>Products priced above market</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {priceComparisonData.filter(p => p.difference > 0).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-slate-700">{item.product.split('(')[0]}</span>
                          <span className="text-sm font-bold text-orange-600">+₹{item.difference.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Avg Price Delta</CardTitle>
                    <CardDescription>Against lowest competitor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      +{priceComparisonData.length > 0 ? Math.round(priceComparisonData.reduce((sum, p) => sum + p.difference, 0) / priceComparisonData.length) : 0}%
                    </div>
                    <p className="text-sm text-slate-600">Causing margin erosion</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Categories at Risk</CardTitle>
                    <CardDescription>High price sensitivity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-700">Dairy Products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-700">Snacks & Beverages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-slate-700">Staples</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Pricing Strategy Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    Our pricing is <span className="font-bold text-purple-700">5-12% higher</span> on low-elasticity categories like Dairy and Staples, 
                    creating unnecessary margin pressure. Recommend <span className="font-bold text-purple-700">selective price reduction</span> on 
                    high-frequency SKUs (Milk, Bread, Eggs) to match Blinkit/Zepto, while maintaining premium on convenience categories (Snacks, Ready-to-eat). 
                    This could improve customer retention by <span className="font-bold text-emerald-700">15-18%</span> in price-sensitive segments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profitability Model */}
          <TabsContent value="profitability" data-testid="content-profitability">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Scenario Controls</CardTitle>
                  <CardDescription>Adjust parameters to model outcomes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Discount Rate: {discountRate[0]}%
                    </label>
                    <Slider
                      data-testid="slider-discount"
                      value={discountRate}
                      onValueChange={setDiscountRate}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Delivery Cost: ₹{deliveryCost[0]}
                    </label>
                    <Slider
                      data-testid="slider-delivery"
                      value={deliveryCost}
                      onValueChange={setDeliveryCost}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Demand Multiplier: {demandMultiplier[0].toFixed(1)}x
                    </label>
                    <Slider
                      data-testid="slider-demand"
                      value={demandMultiplier}
                      onValueChange={setDemandMultiplier}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <Button 
                    data-testid="btn-calculate-scenario"
                    onClick={handleScenarioChange} 
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Calculate Scenario
                  </Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900">
                        ₹{profitability ? (profitability.revenue / 100000).toFixed(2) : 0}L
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{profitability?.orders || 0} orders</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Total Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900">
                        ₹{profitability ? (profitability.total_costs / 100000).toFixed(2) : 0}L
                      </div>
                      <p className="text-sm text-slate-600 mt-1">All expenses included</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${profitability && profitability.profit > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        ₹{profitability ? (profitability.profit / 100000).toFixed(2) : 0}L
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{profitability?.margin_percent || 0}% margin</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Discount Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">
                        ₹{profitability ? (profitability.discount_costs / 100000).toFixed(2) : 0}L
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Monthly burn</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      Profitability Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-slate-700 leading-relaxed">
                        Current scenario shows <span className="font-bold text-emerald-700">{profitability?.margin_percent || 0}% margin</span>. 
                        Reducing discount burn on low-elasticity categories (Staples, Household) from {discountRate[0]}% to 6-7% could improve margin by 
                        <span className="font-bold text-emerald-700"> 3-4 percentage points</span>.
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        Delivery cost optimization through route planning and micro-warehouses could reduce per-order cost from ₹{deliveryCost[0]} to ₹35-38, 
                        adding <span className="font-bold text-emerald-700">₹8-12L monthly profit</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tier-2 Expansion */}
          <TabsContent value="expansion" data-testid="content-expansion">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle>City-wise Feasibility Analysis</CardTitle>
                  <CardDescription>Tier-2 expansion opportunities vs Tier-1 baseline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={cityAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="city" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="feasibility_score" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="margin_potential" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cityAnalysis.filter(c => c.tier === "tier-2").map((city, idx) => (
                  <Card key={idx} className="bg-white/90 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-sky-500" />
                        {city.city}
                      </CardTitle>
                      <CardDescription>{city.tier.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Feasibility</span>
                          <span className="font-semibold text-slate-900">{city.feasibility_score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${city.feasibility_score}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Margin Potential</span>
                          <span className="font-semibold text-emerald-600">{city.margin_potential}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${city.margin_potential * 8}%` }}></div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Monthly Demand</span>
                          <span className="font-semibold text-slate-900">{city.monthly_demand}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-slate-600">Smartphone %</span>
                          <span className="font-semibold text-slate-900">{city.smartphone_penetration}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-sky-600" />
                    Tier-2 Expansion Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-slate-700 leading-relaxed">
                      <span className="font-bold text-sky-700">Coimbatore</span> shows highest potential with 75% feasibility score and 10.2% margin potential. 
                      <span className="font-bold text-sky-700"> Indore</span> and <span className="font-bold text-sky-700">Bhopal</span> follow closely with strong smartphone penetration and lower delivery costs.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-sky-200">
                      <h4 className="font-semibold text-slate-800 mb-2">Recommended Approach: Micro-Warehouse Model</h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>Launch with 2-3 compact fulfillment centers (1500-2000 sq ft) per city</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>Focus on top 200 high-velocity SKUs to minimize inventory costs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>Target 8-10% margin improvement through lower real estate and labor costs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>Projected breakeven within 6-8 months with 4000+ monthly orders</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" data-testid="content-recommendations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    1. Reduce Discount Burn
                  </CardTitle>
                  <CardDescription>Priority: CRITICAL</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Current discount rate of 10-15% on low-elasticity categories (Staples, Dairy, Household) is eroding margins without driving incremental demand.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Action Items:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Reduce discounts on Staples from 12% to 6-7%</li>
                      <li>• Maintain premium on convenience categories</li>
                      <li>• Expected margin improvement: 3-4%</li>
                      <li>• Timeline: Immediate (next 2 weeks)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-sky-600" />
                    2. Improve Delivery Speed
                  </CardTitle>
                  <CardDescription>Priority: HIGH</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Delivery time is the strongest churn driver. Premium customers expect sub-15 minute delivery, currently at 20+ minutes average.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-sky-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Action Items:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Deploy AI-powered route optimization</li>
                      <li>• Add 3-4 dark stores in high-density zones</li>
                      <li>• Prioritize premium customer orders</li>
                      <li>• Expected retention lift: 15-18%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    3. Strategic Pricing Reset
                  </CardTitle>
                  <CardDescription>Priority: HIGH</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    5-12% price premium on high-frequency SKUs is driving customer attrition to Blinkit and Zepto.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Action Items:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Match Blinkit pricing on Milk, Bread, Eggs</li>
                      <li>• Introduce dynamic pricing for peak hours</li>
                      <li>• Bundle strategy for basket optimization</li>
                      <li>• Expected AOV impact: +8-10%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    4. Tier-2 Expansion Pilot
                  </CardTitle>
                  <CardDescription>Priority: MEDIUM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Tier-2 cities show strong feasibility (68-75%) with 8-10% margin potential through lower operational costs.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-emerald-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Action Items:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Launch micro-warehouse model in Coimbatore</li>
                      <li>• 200 SKU focused assortment</li>
                      <li>• Target 4000 orders/month for breakeven</li>
                      <li>• Expected margin: 9-10%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Summary: Expected Impact</CardTitle>
                  <CardDescription>Projected outcomes from implementing all recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">+15-18%</div>
                      <div className="text-sm text-slate-600 mt-1">Retention Improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-sky-600">+8-10%</div>
                      <div className="text-sm text-slate-600 mt-1">Margin Expansion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">₹12-15L</div>
                      <div className="text-sm text-slate-600 mt-1">Monthly Profit Gain</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">6-8 months</div>
                      <div className="text-sm text-slate-600 mt-1">Implementation Timeline</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-slate-600">
            Strategic Analysis Dashboard • Data as of January 2025 • Confidential & Proprietary
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;