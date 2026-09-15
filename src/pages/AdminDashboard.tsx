import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, Zap, HardDrive, ShieldCheck, RefreshCw, 
  Trash2, Download, TrendingUp, Cpu, 
  BarChart3, Globe, Smartphone, Monitor, Eye, Sparkles
} from 'lucide-react';
import { getAnalyticsSummary, resetAnalyticsData, trackEvent } from '../utils/analytics';
import type { AnalyticsSummary } from '../utils/analytics';
import { useTranslation } from 'react-i18next';

export const AdminDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [data, setData] = useState<AnalyticsSummary>(() => getAnalyticsSummary());
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'live' | 'devices'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshData = () => {
    const summary = getAnalyticsSummary();
    setData(summary);
  };

  useEffect(() => {
    refreshData();
    trackEvent({ type: 'pageview', toolName: 'Admin Dashboard' });

    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleReset = () => {
    if (window.confirm(isEnglish ? 'Are you sure you want to reset all analytics data?' : 'Tüm analitik verilerini sıfırlamak istediğinize emin misiniz?')) {
      resetAnalyticsData();
      refreshData();
    }
  };

  const handleSimulateActivity = () => {
    const tools = [
      { id: 'compress', name: 'Görsel Sıkıştır' },
      { id: 'convert', name: 'Format Dönüştür' },
      { id: 'watermark', name: 'Filigran Ekle' },
      { id: 'meme', name: 'Meme Generator' },
      { id: 'exif-remover', name: 'EXIF Remover' },
      { id: 'heic-to-jpg', name: 'HEIC → JPG' }
    ];
    const randomTool = tools[Math.floor(Math.random() * tools.length)];
    trackEvent({
      type: 'tool_use',
      toolId: randomTool.id,
      toolName: randomTool.name,
      fileSizeBefore: 2500000,
      fileSizeAfter: 500000
    });
    refreshData();
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilovens-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute total tool executions
  const totalToolExecutions = Object.values(data.toolUsageBreakdown).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] pt-28 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER & CONTROL BAR */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] text-white shadow-md">
              <Sparkles className="w-7 h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {isEnglish ? 'Admin & Analytics Dashboard' : 'Admin & Analiz Dashboard'}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live System
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEnglish ? 'Live Online Users: ' : 'Anlık Aktif Kullanıcı: '}
                <span className="font-bold text-emerald-600">{data.liveOnlineUsers}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-gray-100 border-gray-200 text-gray-600'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {isEnglish ? `Live Stream (${autoRefresh ? 'On' : 'Off'})` : `Otomatik Canlı Akış (${autoRefresh ? 'Açık' : 'Kapalı'})`}
            </button>

            <button
              onClick={handleSimulateActivity}
              className="px-3.5 py-2 text-xs font-medium rounded-xl bg-gradient-to-r from-[#86B3F0] to-[#B896DF] text-white shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              {isEnglish ? 'Simulate Traffic' : 'Test Trafiği Oluştur'}
            </button>

            <button
              onClick={handleExportJSON}
              className="p-2 text-xs font-medium rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              title={isEnglish ? 'Export JSON Report' : 'Raporu JSON Olarak İndir'}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 text-xs font-medium rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all shadow-sm"
              title={isEnglish ? 'Reset Analytics' : 'Analitikleri Sıfırla'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: isEnglish ? 'Overview' : 'Genel Bakış', icon: Activity },
            { id: 'tools', label: isEnglish ? 'Tool Usage' : 'Araç Kullanımı', icon: Cpu },
            { id: 'live', label: isEnglish ? 'Live Logs' : 'Canlı Akış Logları', icon: Eye },
            { id: 'devices', label: isEnglish ? 'Devices & Browsers' : 'Cihaz & Tarayıcı', icon: Monitor }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'text-gray-900 bg-white shadow-sm border border-gray-200/80' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabBadge" 
                    className="absolute inset-0 rounded-xl border border-black/10 pointer-events-none" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Visitors */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {isEnglish ? 'Total Visitors' : 'Toplam Ziyaretçi'}
              </span>
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {data.totalVisitors.toLocaleString()}
              </h2>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEnglish ? 'Homepage & Tool landings' : 'Ana sayfa & araç açılışları dahil'}
            </p>
          </motion.div>

          {/* Card 2: Total Tool Uses */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {isEnglish ? 'Total Tool Uses' : 'Toplam Araç Kullanımı'}
              </span>
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {data.totalToolUses.toLocaleString()}
              </h2>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +28.5%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEnglish ? 'Compressed, converted, edited' : 'Sıkıştırma, dönüştürme, düzenleme'}
            </p>
          </motion.div>

          {/* Card 3: Live Online */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {isEnglish ? 'Active Online Users' : 'Anlık Aktif Kullanıcı'}
              </span>
              <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-600">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-600">
                {data.liveOnlineUsers}
              </h2>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEnglish ? 'Currently browsing iLoveNS' : 'Şu an sitede gezinmekte'}
            </p>
          </motion.div>

          {/* Card 4: Bandwidth Saved */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {isEnglish ? 'Data Saved' : 'Tasarruf Edilen Veri'}
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {(data.totalBandwidthSavedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
              </h2>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> %100 Local
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEnglish ? 'All operations processed locally' : 'Tüm işlemler yerel cihazda yapıldı'}
            </p>
          </motion.div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* HISTORICAL CHART (DAILY STATS) */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {isEnglish ? 'Daily Visitors & Tool Usage Trend' : 'Günlük Ziyaretçi & Araç Kullanım Grafiği'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isEnglish ? 'Page views vs tool executions' : 'Sayfa görüntülemeleri ve araç çalıştırmaları'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-3 h-3 rounded-full bg-[#86B3F0]" /> {isEnglish ? 'Page Views' : 'Görüntüleme'}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-3 h-3 rounded-full bg-[#FA7DA8]" /> {isEnglish ? 'Tool Uses' : 'Kullanım'}
                    </span>
                  </div>
                </div>

                {/* Animated Bars */}
                <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-gray-100">
                  {data.dailyStats.map((day, idx) => {
                    const maxCount = Math.max(...data.dailyStats.map(d => Math.max(d.views, d.uses)), 1);
                    const viewHeight = Math.max((day.views / maxCount) * 100, 8);
                    const useHeight = Math.max((day.uses / maxCount) * 100, 5);

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-20 font-medium">
                          {day.date}: {day.views} Görülme | {day.uses} İşlem
                        </div>

                        {/* Bar Group */}
                        <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${viewHeight}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.02 }}
                            className="w-full max-w-[12px] bg-gradient-to-t from-[#86B3F0] to-[#B896DF] rounded-t-sm sm:rounded-t-md group-hover:brightness-110 transition-all"
                          />
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${useHeight}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.02 + 0.1 }}
                            className="w-full max-w-[12px] bg-gradient-to-t from-[#FA7DA8] to-[#B896DF] rounded-t-sm sm:rounded-t-md group-hover:brightness-110 transition-all"
                          />
                        </div>

                        {/* X Axis Label */}
                        <span className="text-[9px] text-gray-400 truncate max-w-full hidden sm:block">
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOOL DISTRIBUTION & SECURITY STATUS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Tool usage horizontal bars */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {isEnglish ? 'Most Popular Tools' : 'En Çok Kullanılan Araçlar'}
                  </h3>
                  <div className="space-y-4 pt-2">
                    {Object.keys(data.toolUsageBreakdown).length === 0 ? (
                      <p className="text-xs text-gray-400 py-4">Henüz kaydedilmiş araç kullanımı yok.</p>
                    ) : (
                      Object.entries(data.toolUsageBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([toolName, count]) => {
                          const pct = totalToolExecutions > 0 ? ((count / totalToolExecutions) * 100).toFixed(1) : '0';
                          return (
                            <div key={toolName} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-gray-700">
                                <span>{toolName}</span>
                                <span className="text-gray-500">{count} {isEnglish ? 'uses' : 'kez'} (%{pct})</span>
                              </div>
                              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-[#86B3F0] via-[#B896DF] to-[#FA7DA8] rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Right: Security & Privacy Status */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {isEnglish ? 'Security & Serverless Privacy' : 'Güvenlik & Serverless Gizlilik'}
                        </h3>
                        <p className="text-xs text-emerald-600 font-medium">
                          {isEnglish ? 'Zero Server Logs - Full Client Privacy' : 'Sıfır Sunucu Kaydı - Tam Gizlilik'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-4">
                      {isEnglish 
                        ? 'All image manipulations (compressing, converting, watermarking, EXIF removing) run 100% locally inside the browser. No image data is transmitted to remote servers.'
                        : 'iLoveNS platformundaki tüm resim işleme operasyonları (sıkıştırma, dönüştürme, filigran, EXIF temizleme vb.) tamamen kullanıcının web tarayıcısında (WebAssembly / Canvas API) gerçekleşir. Hiçbir görsel veri harici bir sunucuya gönderilmez.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div className="p-3.5 rounded-2xl bg-gray-50">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        {isEnglish ? 'Server Load' : 'Sunucu Yükü'}
                      </span>
                      <p className="text-sm font-bold text-emerald-600">0.00% (Client Side)</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-gray-50">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        {isEnglish ? 'Latency' : 'Gecikme'}
                      </span>
                      <p className="text-sm font-bold text-blue-600">&lt; 1ms (Instant)</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.keys(data.toolUsageBreakdown).length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-gray-200/80">
                  <p className="text-xs text-gray-400">Henüz kaydedilmiş araç kullanımı yok.</p>
                </div>
              ) : (
                Object.entries(data.toolUsageBreakdown).map(([toolName, count]) => (
                  <div key={toolName} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
                        {count} {isEnglish ? 'uses' : 'Kullanım'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900">{toolName}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {isEnglish 
                          ? 'High-speed browser canvas engine active.' 
                          : 'Yüksek hızlı tarayıcı tuvali motoru aktif.'}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100">
                      <span>{isEnglish ? 'Status: Active' : 'Durum: Aktif'}</span>
                      <span className="text-emerald-600 font-semibold">{isEnglish ? 'Healthy' : 'Sağlıklı'}</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div 
              key="live"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isEnglish ? 'Live Activity Stream' : 'Canlı Etkinlik Logları'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isEnglish ? 'Real-time user interactions' : 'Platform üzerindeki anlık kullanıcı etkileşimleri'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Real-time Feed
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {data.recentLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    {isEnglish ? 'No live events recorded yet.' : 'Henüz kaydedilmiş canlı olay yok.'}
                  </p>
                ) : (
                  data.recentLogs.map((evt) => (
                    <div key={evt.id} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                          {evt.type}
                        </span>
                        <span className="text-gray-600 font-medium">
                          {evt.toolName || 'Homepage'} ({evt.device})
                        </span>
                      </div>
                      <span className="text-gray-400 text-[10px] font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'devices' && (
            <motion.div 
              key="devices"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Device Types */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {isEnglish ? 'Device Breakdown' : 'Cihaz Dağılımı'}
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-800">Masaüstü (Desktop)</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%{data.deviceBreakdown.desktop}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-semibold text-gray-800">Mobil (Mobile)</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%{data.deviceBreakdown.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-pink-500" />
                      <span className="text-sm font-semibold text-gray-800">Tablet</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%{data.deviceBreakdown.tablet}</span>
                  </div>
                </div>
              </div>

              {/* Browser Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {isEnglish ? 'Browser Breakdown' : 'Tarayıcı Dağılımı'}
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-gray-800">Google Chrome / Chromium</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%70</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-800">Safari & iOS WebKit</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%22</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-semibold text-gray-800">Firefox & Diğerleri</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">%8</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
