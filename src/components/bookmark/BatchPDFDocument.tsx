import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, G, Rect, Path, Circle } from '@react-pdf/renderer';
import { BookmarkItem } from '../../types';
import { PDFTemplate } from './PDFTemplates';

// Register Unicode-supported fonts for Vietnamese
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf', fontStyle: 'italic' }
  ]
});

Font.register({
  family: 'PlayfairDisplay',
  src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZcxv_7WUr8xs68FsgvM-p_V.ttf',
  fontWeight: 'bold'
});

// Styles config for each template
const modernStyles = StyleSheet.create({
  coverPage: { padding: 50, backgroundColor: '#FAF8F5', fontFamily: 'Roboto', justifyContent: 'center', alignItems: 'center', height: '100%' },
  coverTitle: { fontSize: 30, color: '#78350F', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  coverSubtitle: { fontSize: 13, color: '#D97706', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 40 },
  coverMetaBox: { borderTop: '1 solid #E2E8F0', paddingTop: 20, width: '100%', maxWidth: 300, alignItems: 'center', gap: 6 },
  coverMetaText: { fontSize: 9.5, color: '#64748B' },
  
  page: { padding: 40, backgroundColor: '#FAF8F5', fontFamily: 'Roboto', fontSize: 9.5, color: '#334155' },
  header: { borderBottom: '2 solid #78350F', paddingBottom: 10, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 18, color: '#78350F', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 8.5, color: '#D97706', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  metaItem: { fontSize: 8, color: '#64748B' },
  
  body: { flexDirection: 'row', gap: 15 },
  leftCol: { width: '55%', flexDirection: 'column', gap: 8 },
  rightCol: { width: '42%', flexDirection: 'column', gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#78350F', borderBottom: '1 solid #E2E8F0', paddingBottom: 3, marginBottom: 5 },
  description: { lineHeight: 1.4, color: '#475569', fontSize: 9 },
  imageContainer: { borderRadius: 8, overflow: 'hidden', border: '1 solid #E2E8F0', backgroundColor: '#F1F5F9', marginBottom: 5 },
  image: { width: '100%', height: 150, objectFit: 'cover' },
  bulletList: { marginTop: 2 },
  bulletItem: { flexDirection: 'row', gap: 5, marginBottom: 3, lineHeight: 1.3 },
  bulletDot: { width: 4, height: 4, backgroundColor: '#D97706', borderRadius: 2, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#1E293B' },
  noteBox: { backgroundColor: '#FEF3C7', borderLeft: '3 solid #D97706', padding: 8, borderRadius: 4, marginTop: 5 },
  noteText: { fontStyle: 'italic', color: '#78350F', lineHeight: 1.3, fontSize: 8.5 },
  reminderBox: { backgroundColor: '#EFF6FF', borderLeft: '3 solid #3B82F6', padding: 6, borderRadius: 4, marginTop: 5 },
  reminderText: { color: '#1E40AF', fontSize: 8 },
  aiBadge: { backgroundColor: '#F59E0B', color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', padding: '1.5 5', borderRadius: 10, marginTop: 4, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTop: '1 solid #E2E8F0', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', color: '#94A3B8', fontSize: 8.5 },
  
  tocTitle: { fontSize: 18, color: '#78350F', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 15, borderBottom: '1 solid #78350F', paddingBottom: 6 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 dotted #E2E8F0', paddingBottom: 6, marginBottom: 8, fontSize: 9.5 }
});

const classicStyles = StyleSheet.create({
  coverPage: { padding: 50, backgroundColor: '#FAF6F0', fontFamily: 'Roboto', justifyContent: 'center', alignItems: 'center' },
  coverTitle: { fontSize: 26, color: '#5C3D2E', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  coverSubtitle: { fontSize: 11, color: '#855843', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 35 },
  coverMetaBox: { border: '1 solid #D9C3B0', padding: 15, width: '100%', maxWidth: 320, alignItems: 'center', gap: 6, backgroundColor: '#FDFBF7' },
  coverMetaText: { fontSize: 9, color: '#786865', fontStyle: 'italic' },
  
  page: { padding: 45, backgroundColor: '#FAF6F0', fontFamily: 'Roboto', fontSize: 9.5, color: '#2B2625' },
  header: { borderBottom: '1 solid #5C3D2E', paddingBottom: 10, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 16, color: '#5C3D2E', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 8, color: '#855843', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  metaItem: { fontSize: 7.5, color: '#786865' },
  
  body: { flexDirection: 'column', gap: 12 },
  leftCol: { width: '100%', flexDirection: 'column', gap: 6 },
  rightCol: { width: '100%', flexDirection: 'column', gap: 6 },
  sectionTitle: { fontSize: 9.5, fontWeight: 'bold', color: '#5C3D2E', textTransform: 'uppercase', borderBottom: '1 solid #D9C3B0', paddingBottom: 2, marginBottom: 4, letterSpacing: 0.5 },
  description: { lineHeight: 1.45, color: '#3A3332', fontSize: 9, textAlign: 'justify' },
  imageContainer: { border: '1 solid #D9C3B0', padding: 3, backgroundColor: '#FFFFFF', textAling: 'center', alignSelf: 'center', marginBottom: 8 },
  image: { width: 340, height: 150, objectFit: 'cover' },
  bulletList: { marginTop: 2 },
  bulletItem: { flexDirection: 'row', gap: 5, marginBottom: 3, lineHeight: 1.3 },
  bulletDot: { width: 3, height: 3, backgroundColor: '#855843', borderRadius: 1.5, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#1A1412' },
  noteBox: { border: '1 solid #D9C3B0', borderStyle: 'dashed', padding: 8, marginTop: 6, backgroundColor: '#FDFBF7' },
  noteText: { fontStyle: 'italic', color: '#5C3D2E', lineHeight: 1.4, fontSize: 8.5 },
  reminderBox: { border: '1 dashed #93C5FD', padding: 6, marginTop: 5, backgroundColor: '#F0F7FF' },
  reminderText: { color: '#1E3A8A', fontSize: 8 },
  aiBadge: { border: '1 solid #855843', color: '#855843', fontSize: 7, fontWeight: 'bold', padding: '1 4', alignSelf: 'center', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 30, left: 45, right: 45, borderTop: '0.5 solid #D9C3B0', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', color: '#9E8E8B', fontSize: 8 },
  
  tocTitle: { fontSize: 16, color: '#5C3D2E', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', borderBottom: '1 solid #5C3D2E', paddingBottom: 4 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 solid #E8DFD8', paddingBottom: 4, marginBottom: 6, fontSize: 9 }
});

const minimalStyles = StyleSheet.create({
  coverPage: { padding: 50, backgroundColor: '#FFFFFF', fontFamily: 'Roboto', justifyContent: 'center', alignItems: 'flex-start' },
  coverTitle: { fontSize: 32, color: '#111827', fontWeight: 'bold', textAlign: 'left', marginBottom: 10 },
  coverSubtitle: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 50 },
  coverMetaBox: { borderLeft: '2 solid #111827', paddingLeft: 15, alignItems: 'flex-start', gap: 5 },
  coverMetaText: { fontSize: 9, color: '#4B5563' },
  
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Roboto', fontSize: 9, color: '#1F2937' },
  header: { borderBottom: '1 solid #E5E7EB', paddingBottom: 8, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, color: '#111827', fontWeight: 'bold', marginBottom: 2 },
  category: { fontSize: 8, color: '#4B5563', fontWeight: 'bold', textTransform: 'uppercase' },
  metaItem: { fontSize: 7.5, color: '#9CA3AF' },
  
  body: { flexDirection: 'row', gap: 20 },
  leftCol: { width: '58%', flexDirection: 'column', gap: 6 },
  rightCol: { width: '38%', flexDirection: 'column', gap: 6 },
  sectionTitle: { fontSize: 9.5, fontWeight: 'bold', color: '#111827', borderBottom: '1 solid #F3F4F6', paddingBottom: 2, marginBottom: 4 },
  description: { lineHeight: 1.4, color: '#374151', fontSize: 8.5 },
  imageContainer: { overflow: 'hidden', border: '1 solid #F3F4F6', marginBottom: 5 },
  image: { width: '100%', height: 140, objectFit: 'cover' },
  bulletList: { marginTop: 2 },
  bulletItem: { flexDirection: 'row', gap: 5, marginBottom: 3, lineHeight: 1.3 },
  bulletDot: { width: 3, height: 3, backgroundColor: '#4B5563', borderRadius: 1.5, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#111827' },
  noteBox: { backgroundColor: '#F9FAFB', borderLeft: '2 solid #4B5563', padding: 6, marginTop: 4 },
  noteText: { color: '#374151', lineHeight: 1.3, fontSize: 8.5 },
  reminderBox: { backgroundColor: '#F3F4F6', borderLeft: '2 solid #9CA3AF', padding: 5, marginTop: 4 },
  reminderText: { color: '#4B5563', fontSize: 8 },
  aiBadge: { border: '1 solid #E5E7EB', color: '#6B7280', fontSize: 7, padding: '1 4', marginTop: 4, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTop: '1 solid #F3F4F6', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', color: '#9CA3AF', fontSize: 7.5 },
  
  tocTitle: { fontSize: 18, color: '#111827', fontWeight: 'bold', marginBottom: 15, borderBottom: '1 solid #111827', paddingBottom: 4 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 solid #F3F4F6', paddingBottom: 4, marginBottom: 6, fontSize: 9 }
});

const statsStyles = StyleSheet.create({
  section: {
    marginVertical: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1 solid #E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#78350F',
    marginBottom: 10,
    borderBottom: '1 solid #FCD34D',
    paddingBottom: 4,
    fontFamily: 'PlayfairDisplay',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 15,
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 8,
    border: '1 solid #E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350F',
    fontFamily: 'PlayfairDisplay',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 15,
  },
  chartBox: {
    padding: 10,
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    border: '1 solid #E2E8F0',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 7.5,
    color: '#475569',
  },
});

interface StatisticsData {
  total: number;
  aiRestored: number;
  withNotes: number;
  categories: { name: string; count: number }[];
  timeline: { month: string; count: number }[];
  aiConfidence: { range: string; count: number }[];
  averageRating: number;
}

function computeStatistics(bookmarks: BookmarkItem[]): StatisticsData {
  const total = bookmarks.length;
  const aiRestored = bookmarks.filter((b) => b.isAIRestored).length;
  const withNotes = bookmarks.filter((b) => b.note && b.note.trim().length > 0).length;

  const categoryMap = new Map<string, number>();
  bookmarks.forEach((b) => {
    const cat = b.category || 'Khác';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const monthMap = new Map<string, number>();
  bookmarks.forEach((b) => {
    let monthName = 'Chưa rõ';
    try {
      if (b.createdAt) {
        const date = new Date(b.createdAt);
        if (!isNaN(date.getTime())) {
          monthName = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        }
      }
    } catch {
      // fallback
    }
    monthMap.set(monthName, (monthMap.get(monthName) || 0) + 1);
  });
  const timeline = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      if (a.month === 'Chưa rõ') return 1;
      if (b.month === 'Chưa rõ') return -1;
      try {
        const [monthA, yearA] = a.month.split('/').map(Number);
        const [monthB, yearB] = b.month.split('/').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      } catch {
        return a.month.localeCompare(b.month);
      }
    });

  const aiItems = bookmarks.filter((b) => b.isAIRestored && b.recognition?.confidence);
  const confidenceRanges = [
    { range: '0-20%', min: 0, max: 0.2 },
    { range: '20-40%', min: 0.2, max: 0.4 },
    { range: '40-60%', min: 0.4, max: 0.6 },
    { range: '60-80%', min: 0.6, max: 0.8 },
    { range: '80-100%', min: 0.8, max: 1.05 },
  ];
  const aiConfidence = confidenceRanges.map(({ range, min, max }) => ({
    range,
    count: aiItems.filter(
      (b) => b.recognition!.confidence >= min && b.recognition!.confidence < max
    ).length,
  }));

  const ratedItems = bookmarks.filter((b) => b.rating);
  const averageRating = ratedItems.length > 0
    ? ratedItems.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedItems.length
    : 0;

  return { total, aiRestored, withNotes, categories, timeline, aiConfidence, averageRating };
}

interface BarChartProps {
  data: { name?: string; range?: string; month?: string; count: number }[];
  width?: number;
  height?: number;
  colors?: string[];
}

const BarChartSVG = ({ data, width = 230, height = 120, colors = ['#D97706', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444'] }: BarChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 8, color: '#94A3B8' }}>Không có dữ liệu</Text>
      </View>
    );
  }
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const paddingLeft = 15;
  const paddingRight = 10;
  const paddingBottom = 15;
  const paddingTop = 15;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const barGap = 6;
  const totalGapsWidth = barGap * (data.length - 1);
  const barWidth = data.length > 0 ? (chartWidth - totalGapsWidth) / data.length : 30;
  
  return (
    <Svg width={width} height={height}>
      {data.map((item, index) => {
        const barHeight = (item.count / maxVal) * chartHeight;
        const x = paddingLeft + index * (barWidth + barGap);
        const y = height - paddingBottom - barHeight;
        const color = colors[index % colors.length];
        const label = item.name || item.range || item.month || '';
        const shortLabel = label.length > 8 ? label.slice(0, 7) + '..' : label;

        return (
          <G key={index}>
            {/* Column bar shadow/fill */}
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={1.5}
            />
            {/* Number value label */}
            {item.count > 0 && (
              <Text
                x={x + barWidth / 2}
                y={y - 4}
                style={{ fontSize: 7, fill: '#1E293B', textAnchor: 'middle' }}
              >
                {String(item.count)}
              </Text>
            )}
            {/* Axis label */}
            <Text
              x={x + barWidth / 2}
              y={height - 4}
              style={{ fontSize: 6, fill: '#64748B', textAnchor: 'middle' }}
            >
              {shortLabel}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
};

interface DonutChartProps {
  data: { name: string; count: number }[];
  width?: number;
  height?: number;
  colors?: string[];
}

const DonutChartSVG = ({ data, width = 110, height = 110, colors = ['#8B5CF6', '#E2E8F0'] }: DonutChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 8, color: '#94A3B8' }}>Không có dữ liệu</Text>
      </View>
    );
  }
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 8, color: '#94A3B8' }}>Không có dữ liệu</Text>
      </View>
    );
  }

  const radius = 35;
  const centerX = width / 2;
  const centerY = height / 2;
  let startAngle = -Math.PI / 2; // Start from top

  const slices = data.map((item, index) => {
    const percentage = item.count / total;
    const angle = percentage * 2 * Math.PI;
    const endAngle = startAngle + angle;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    // Draw slice path. If it's a 100% full circle, SVG arc path can glitch, handled gracefully.
    let pathData = '';
    if (percentage >= 0.99) {
      pathData = `
        M ${centerX} ${centerY - radius}
        A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius}
        Z
      `;
    } else {
      pathData = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
    }
    
    const slice = {
      path: pathData,
      color: colors[index % colors.length],
    };
    startAngle = endAngle;
    return slice;
  });

  return (
    <Svg width={width} height={height}>
      {slices.map((slice, index) => (
        <Path key={index} d={slice.path} fill={slice.color} />
      ))}
      <Circle cx={centerX} cy={centerY} r={radius * 0.55} fill="#FAF8F5" />
      <Text
        x={centerX}
        y={centerY + 3}
        style={{ fontSize: 10, fill: '#1E293B', textAnchor: 'middle' }}
      >
        {String(total)}
      </Text>
    </Svg>
  );
};

export function PDFStatistics({ bookmarks }: { bookmarks: BookmarkItem[] }) {
  const stats = computeStatistics(bookmarks);
  const categoryData = stats.categories.slice(0, 5); // top 5
  
  const aiData = [
    { name: 'Khôi phục AI', count: stats.aiRestored },
    { name: 'Kỹ thuật số', count: stats.total - stats.aiRestored },
  ];
  
  const confidenceData = stats.aiConfidence.filter((d) => d.count > 0);

  return (
    <View style={statsStyles.section}>
      <Text style={statsStyles.sectionTitle}>📊 Thống Kê Tổng Quan Di Sản</Text>

      {/* Stats Cards */}
      <View style={statsStyles.row}>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.statValue}>{String(stats.total)}</Text>
          <Text style={statsStyles.statLabel}>Hiện vật</Text>
        </View>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.statValue}>{String(stats.aiRestored)}</Text>
          <Text style={statsStyles.statLabel}>Phục dựng AI</Text>
        </View>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.statValue}>{String(stats.withNotes)}</Text>
          <Text style={statsStyles.statLabel}>Ghi chú</Text>
        </View>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.statValue}>
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
          </Text>
          <Text style={statsStyles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* Charts Grid */}
      <View style={statsStyles.chartsContainer}>
        {/* Chart 1: Categories Bar Chart */}
        {categoryData.length > 0 && (
          <View style={[statsStyles.chartBox, { width: '56%' }]}>
            <Text style={statsStyles.chartTitle}>Cơ cấu khảo cứu di sản</Text>
            <BarChartSVG
              data={categoryData}
              width={260}
              height={110}
              colors={['#78350F', '#D97706', '#1E40AF', '#10B981', '#6366F1']}
            />
          </View>
        )}

        {/* Chart 2: AI Ratio Donut */}
        {stats.total > 0 && (
          <View style={[statsStyles.chartBox, { width: '40%' }]}>
            <Text style={statsStyles.chartTitle}>Tỉ lệ áp dụng AI</Text>
            <DonutChartSVG
              data={aiData}
              width={110}
              height={110}
              colors={['#D97706', '#E2E8F0']}
            />
            <View style={statsStyles.legendRow}>
              {aiData.map((item, idx) => (
                <View key={idx} style={statsStyles.legendItem}>
                  <View style={[statsStyles.legendColor, { backgroundColor: ['#D97706', '#CBD5E1'][idx] }]} />
                  <Text style={statsStyles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Confidence bar chart if applicable */}
      {confidenceData.length > 0 && (
        <View style={[statsStyles.chartBox, { marginTop: 12, width: '100%', alignItems: 'center' }]}>
          <Text style={statsStyles.chartTitle}>Phân phối độ tin cậy nhận diện (%)</Text>
          <BarChartSVG
            data={confidenceData}
            width={430}
            height={90}
            colors={['#D97706']}
          />
        </View>
      )}
    </View>
  );
}


interface BatchPDFDocumentProps {
  bookmarks: BookmarkItem[];
  template?: PDFTemplate;
  reportTitle?: string;
}

export function BatchPDFDocument({ bookmarks, template = 'modern', reportTitle = 'Báo Cáo Tổng Hợp Di Sản' }: BatchPDFDocumentProps) {
  const getStyles = (tmp: PDFTemplate) => {
    switch (tmp) {
      case 'classic': return classicStyles;
      case 'minimal': return minimalStyles;
      default: return modernStyles;
    }
  };

  const styles = getStyles(template);
  const totalWithNotes = bookmarks.filter((b) => b.note && b.note.trim().length > 0).length;
  const totalAIRestored = bookmarks.filter((b) => b.isAIRestored).length;

  const showTOC = bookmarks.length > 3;
  const showStats = bookmarks.length > 1;

  // Calculate total pages
  let totalPages = 1; // Always Cover page
  if (showTOC) totalPages += 1;
  if (showStats) totalPages += 1;
  totalPages += bookmarks.length;

  return (
    <Document title={reportTitle}>
      {/* 1. COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>🏛️ {reportTitle}</Text>
        <Text style={styles.coverSubtitle}>Khảo Cứu & Bảo Tồn Di Sản Số</Text>
        
        <View style={styles.coverMetaBox}>
          <Text style={styles.coverMetaText}>Tổng số hiện vật: {bookmarks.length}</Text>
          <Text style={styles.coverMetaText}>Phục chế bằng AI: {totalAIRestored}</Text>
          <Text style={styles.coverMetaText}>Ghi chú nghiên cứu: {totalWithNotes}</Text>
          <Text style={[styles.coverMetaText, { marginTop: 10 }]}>
            Thời gian kết xuất: {new Date().toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={[styles.coverMetaText, { position: 'absolute', bottom: 40, fontSize: 8 }]}>
          XUẤT BỞI CULTURALVAULT DIGITAL WORKSTATION
        </Text>
      </Page>

      {/* 2. TABLE OF CONTENTS */}
      {showTOC && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.tocTitle}>📑 Mục lục báo cáo</Text>
          <View style={{ marginTop: 10 }}>
            {bookmarks.map((b, index) => {
              // Calculate page for this bookmark
              let itemPage = 1; // Cover
              if (showTOC) itemPage += 1; // TOC itself
              if (showStats) itemPage += 1; // Stats page
              itemPage += (index + 1); // Specific bookmark page

              return (
                <View key={b.id} style={styles.tocItem}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {index + 1}. {b.title}
                  </Text>
                  <Text style={{ color: '#64748B' }}>
                    Trang {itemPage}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.footer}>
            <Text>© {new Date().getFullYear()} CulturalVault</Text>
            <Text>Mục lục • Trang 2</Text>
          </View>
        </Page>
      )}

      {/* 2.5 STATISTICS REPORT PAGE */}
      {showStats && (
        <Page size="A4" style={styles.page}>
          <PDFStatistics bookmarks={bookmarks} />
          <View style={styles.footer}>
            <Text>© {new Date().getFullYear()} CulturalVault</Text>
            <Text>Báo cáo thống kê • Trang {showTOC ? 3 : 2}</Text>
          </View>
        </Page>
      )}

      {/* 3. INDIVIDUAL BOOKMARK PAGES */}
      {bookmarks.map((bookmark, index) => {
        const cleanTags = bookmark.tags || [];
        // Compute exact page number for this individual bookmark page
        let pageNum = 1; // Cover page
        if (showTOC) pageNum += 1;
        if (showStats) pageNum += 1;
        pageNum += (index + 1);

        return (
          <Page key={bookmark.id} size="A4" style={styles.page}>
            {/* Header Block */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.category}>{bookmark.category || 'Di Sản Văn Hóa'}</Text>
                  <Text style={styles.title}>{bookmark.title}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {bookmark.year !== undefined && (
                    <Text style={styles.metaItem}>
                      Thời kỳ: {bookmark.year > 0 ? `Năm ${bookmark.year}` : `${Math.abs(bookmark.year)} TCN`}
                    </Text>
                  )}
                  {bookmark.location && <Text style={styles.metaItem}>Vùng lưu trữ: {bookmark.location}</Text>}
                </View>
              </View>
            </View>

            {/* Content Body Block */}
            <View style={styles.body}>
              {/* Cột Trái: Ảnh và Các thuộc tính cơ bản */}
              <View style={styles.leftCol}>
                {(bookmark.restoredImage || bookmark.imageUrl) && (
                  <View style={styles.imageContainer}>
                    <Image src={bookmark.restoredImage || bookmark.imageUrl || ''} style={styles.image} />
                  </View>
                )}

                <Text style={styles.sectionTitle}>Mô Tả Di Sản Bản Ghi</Text>
                <Text style={styles.description}>{bookmark.description}</Text>

                {bookmark.rating && (
                  <Text style={[styles.metaItem, { marginTop: 4 }]}>
                    Tầm quan trọng lịch sử: <Text style={styles.textBold}>{bookmark.rating}/5 sao</Text>
                  </Text>
                )}

                {bookmark.isAIRestored && (
                  <View style={styles.aiBadge}>
                    <Text>✨ PHỤC DỰNG BỞI TRÍ TUỆ NHÂN TẠO</Text>
                  </View>
                )}
              </View>

              {/* Cột Phải: Phân tích AI, Ghi chú */}
              <View style={styles.rightCol}>
                {bookmark.recognition && (
                  <>
                    <Text style={styles.sectionTitle}>Báo Cáo Nhận Diện AI</Text>
                    <View style={styles.bulletList}>
                      {bookmark.recognition.objectName && (
                        <View style={styles.bulletItem}>
                          <View style={styles.bulletDot} />
                          <Text style={{ fontSize: 8.5 }}><Text style={styles.textBold}>Tên:</Text> {bookmark.recognition.objectName}</Text>
                        </View>
                      )}
                      {bookmark.recognition.culture && (
                        <View style={styles.bulletItem}>
                          <View style={styles.bulletDot} />
                          <Text style={{ fontSize: 8.5 }}><Text style={styles.textBold}>Văn hóa:</Text> {bookmark.recognition.culture}</Text>
                        </View>
                      )}
                      {bookmark.recognition.period && (
                        <View style={styles.bulletItem}>
                          <View style={styles.bulletDot} />
                          <Text style={{ fontSize: 8.5 }}><Text style={styles.textBold}>Niên đại đại diện:</Text> {bookmark.recognition.period}</Text>
                        </View>
                      )}
                      {bookmark.recognition.confidence !== undefined && (
                        <View style={styles.bulletItem}>
                          <View style={styles.bulletDot} />
                          <Text style={{ fontSize: 8.5 }}><Text style={styles.textBold}>Độ tự tin:</Text> {(bookmark.recognition.confidence * 100).toFixed(1)}%</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Tags */}
                {cleanTags.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Thành phần định danh</Text>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#4B5563' }}>
                      {cleanTags.join(', ')}
                    </Text>
                  </>
                )}

                {/* Ghi chú cá nhân */}
                {bookmark.note ? (
                  <View style={styles.noteBox}>
                    <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: styles.noteText.color, marginBottom: 2 }}>GHI CHÚ NGHIÊN CỨU</Text>
                    <Text style={styles.noteText}>{bookmark.note}</Text>
                  </View>
                ) : null}

                {/* Nhắc nhở */}
                {bookmark.reminder && !bookmark.reminder.completed ? (
                  <View style={styles.reminderBox}>
                    <Text style={{ fontSize: 7.5, fontWeight: 'bold', color: styles.reminderText.color, marginBottom: 2 }}>⏰ LỊCH NHẮC KHẢO CỨU</Text>
                    <Text style={styles.reminderText}>
                      Thời gian: {new Date(bookmark.reminder.date).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {bookmark.reminder.note && (
                      <Text style={[styles.reminderText, { marginTop: 1, fontStyle: 'italic' }]}>
                        Nội dung: {bookmark.reminder.note}
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text>Báo cáo sưu tập CulturalVault • Di sản {index + 1}/{bookmarks.length}</Text>
              <Text>Trang {pageNum} / {totalPages}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
